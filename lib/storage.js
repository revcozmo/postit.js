var _ = require('underscore');
var fs = require('fs');
var gpg = require('gpg');
var moment = require('moment');
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
  ensureExpectedStructureExists();
  var content = fs.readFileSync(getListFile(), 'UTF-8');
  return JSON.parse(content);
}

function storeList(list) {
  var content = JSON.stringify(list, 0, 2);
  fs.writeFileSync(getListFile(), content, 'UTF-8');
}

function writeContent(id, content, callback) {
  var key = process.env.POSTIT_KEY_ID;
  gpg.encrypt(content, ['--recipient', key], function(error, buf) {
    if (error) return callback(error);
    fs.writeFileSync(getContentFile(id), buf);
    callback(null);
  });
}

function readContent(id, callback) {
  var buf = fs.readFileSync(getContentFile(id));
  gpg.decrypt(buf, function(error, buffer) {
    if (error) return callback(error, null);
    callback(null, buffer.toString('UTF-8'));
  });
}

module.exports.store = function(title, content, callback) {
  var list = loadList();
  var now = moment().toISOString();
  var meta = {
    id: uuid.v4(),
    title: title,
    tags: [],
    created: now,
    modified: now
  };
  list.push(meta);
  storeList(list);
  writeContent(meta.id, content, function(error) {
    if (error) return callback(error, null);
    callback(null, meta.id);
  });
};

module.exports.list = function() {
  return loadList();
};

module.exports.content = readContent;

module.exports.remove = function(id) {
  fs.unlinkSync(getContentFile(id));

  var list = loadList();
  var filteredList = list.filter(function(entry) {
    return entry.id !== id;
  });
  storeList(filteredList);
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
