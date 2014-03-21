var _ = require('underscore');
var fs = require('fs');
var fuzzy = require('fuzzy.js');
var gpg = require('gpg');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var util = require('./util');
var uuid = require('node-uuid');

fuzzy.analyzeSubTerms = true;

function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getPostItHome() {
  return process.env.POSTIT_HOME;
}

function getListFile() {
  return getPostItHome() + '/meta.json';
}

function getContentHome() {
  return getPostItHome() + '/notes';
}

function getContentFile(id) {
  return getContentHome() + '/' + id + '.md.gpg';
}

function ensureExpectedStructureExists() {
  if (!fs.existsSync(getPostItHome())) {
    fs.mkdirSync(getPostItHome());
  }

  if (!fs.existsSync(getContentHome())) {
    fs.mkdirSync(getContentHome());
  }

  if (!fs.existsSync(getListFile())) {
    fs.writeFileSync(getListFile(), '[]', 'UTF-8');
  }
}


function loadList() {
  return util.promisify(fs.readFile, getListFile(), 'UTF-8')
  .then(function(content) {
    return JSON.parse(content)
    .map(function(note) {
      note.created = moment(note.created);
      note.modified = moment(note.modified);
      return note;
    });
  });
}

function storeList(list) {
  var transformed = list.map(function(note) {
    var cloned = _.clone(note);
    cloned.created = note.created.toISOString();
    cloned.modified = note.modified.toISOString();
    return cloned;
  });
  var content = JSON.stringify(transformed, 0, 2);
  return util.promisify(fs.writeFile, getListFile(), content, 'UTF-8');
}

function encrypt(str) {
  return new Promise(function(resolve, reject) {
    var key = process.env.POSTIT_KEY_ID;
    gpg.encrypt(str, ['--recipient', key], function(error, buf) {
      if (error) {
        reject(error);
      } else {
        resolve(buf);
      }
    });
  });
}

function decrypt(buffer) {
  return new Promise(function(resolve, reject) {
    gpg.decrypt(buffer, function(error, buffer) {
      if (error) {
        reject(error);
      } else {
        resolve(buffer.toString('UTF-8'));
      }
    });
  });
}

function writeEncryptedContent(id, content) {
  return encrypt(content)
  .then(function(buffer) {
    return util.promisify(fs.writeFile, getContentFile(id), buffer)
  });
}

function readEncryptedContent(id) {
  return util.promisify(fs.readFile, getContentFile(id))
  .then(decrypt);
}

function forceUnlink(path) {
  return new Promise(function(resolve, reject) {
    fs.unlink(path, function(error) {
      if (error) {
        if (error.code !== 'ENOENT') {
          reject(error);
          return;
        }
      }
      resolve();
    })
  });
}

module.exports.store = function(title, content, callback) {
  return loadList()
  .then(function(list) {
    var now = moment();
    var meta = {
      id: uuid.v4(),
      title: title,
      tags: [],
      created: now,
      modified: now
    };
    list.push(meta);

    return storeList(list)
    .then(function() {
      return writeEncryptedContent(meta.id, content);
    })
    .then(_.constant(meta.id));
  });
};

module.exports.list = function() {
  return loadList();
};

module.exports.content = readEncryptedContent;

module.exports.remove = function(id) {
  var file = getContentFile(id);

  return forceUnlink(file)
  .then(loadList)
  .then(function(list) {
    var filteredList = list.filter(function(entry) {
      return entry.id !== id;
    });
    return storeList(filteredList);
  });
};

module.exports.edit = function(id, content) {
  return writeEncryptedContent(id, content)
  .then(loadList)
  .then(function(list) {
    var note = _.find(list, function(note) {
      return note.id === id;
    });
    note.modified = moment();
    return storeList(list);
  });
};

function findById(query) {
  return loadList()
  .then(function(notes) {
    query = query.toLowerCase();
    var note = _.find(notes, function(note) {
      return note.id.toLowerCase().indexOf(query) === 0;
    });

    if (!note) {
      throw new Error('Could not find a note with ID ' + query);
    }

    return note;
  });
}

function findByTitle(query) {
  return loadList()
  .then(function(notes) {
    query = query.toLowerCase();
    var matches = notes.map(function(note) {
      var match = fuzzy(note.title, query);
      match.note = note;
      return match;
    });
    matches.sort(fuzzy.matchComparator);

    if (matches.length === 0) {
      throw new Error('Could not find a note by query: ' + query);
    } else if (matches.length === 1) {
      return matches[0].note;
    } else {
      if (matches[0].score * 0.66 > matches[1].score) {
        return matches[0].note;
      } else {
        var msg = 'Ambiguous note query. Please provide more details.';
        throw new Error(msg);
      }
    }
  });
}

module.exports.findNote = function(query) {
  if (query.indexOf(':') === 0) {
    return findById(query.substring(1));
  } else {
    return findByTitle(query);
  }
};

module.exports.categorize = function(id, category) {
  return findById(id)
  .then(function(note) {
    note.category = category;

    return loadList()
    .then(function(notes) {
      return notes.filter(function(eachNote) {
        return eachNote.id !== note.id;
      });
    })
    .then(function(notes) {
      notes.push(note);
      return notes;
    })
    .then(storeList);
  })
};

ensureExpectedStructureExists();
