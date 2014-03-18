var _ = require('underscore');
var fs = require('fs');
var gpg = require('gpg');
var moment = require('moment');
var Promise = require('es6-promise').Promise;
var util = require('./util');
var uuid = require('node-uuid');

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
  // TODO check POSTIT environment variables
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
    return JSON.parse(content);
  });
}

function storeList(list) {
  var content = JSON.stringify(list, 0, 2);
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

function writeEncryptedContent(id, content) {
  return encrypt(content)
  .then(function(buffer) {
    return util.promisify(fs.writeFile, getContentFile(id), buffer)
  });
}

function readContent(id, callback) {
  var buf = fs.readFileSync(getContentFile(id));
  gpg.decrypt(buf, function(error, buffer) {
    if (error) return callback(error, null);
    callback(null, buffer.toString('UTF-8'));
  });
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
    var now = moment().toISOString();
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

module.exports.content = readContent;

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

module.exports.edit = function(id, content, callback) {
  writeContent(id, content, function(error) {
    if (error) return callback(error);

    var list = loadList();
    var note = _.find(list, function(note) {
      return note.id === id;
    });
    note.modified = moment().toISOString();
    storeList(list);
    callback(null);
  });
};
