var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');
var Promise = require('es6-promise').Promise;
var storage = require('./storage');
var uuid = require('node-uuid');
var util = require('util');

module.exports.toShortId = function(id) {
  return id.substring(0, 8);
};

module.exports.findNoteById = function(argv, commandName) {
  return new Promise(function(resolve, reject) {
    if (argv.length < 2) {
      var msg = util.format('%s requires the note ID as the second parameter.',
        commandName);
      return reject(new Error(msg));
    }

    var query = argv[1];
    return storage.findNote(query)
    .then(function(note) {
      resolve(note);
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

var promisify = module.exports.promisify = function(fn /*, args */) {
  var args = [].slice.call(arguments, 1);
  return new Promise(function(resolve, reject) {
    args.push(function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    fn.apply(null, args);
  });
};

(function() {
  function createTempFile(content) {
    var name = 'postit-' + uuid.v4() + '.md';
    var path = '/tmp/' + name;
    return promisify(fs.writeFile, path, content || '', 'UTF-8')
      .then(_.constant(path));
  }

  function deleteTempFile(path) {
    return promisify(fs.unlink, path);
  }

  function readTmpFile(path) {
    return promisify(fs.readFile, path, 'UTF-8')
    .then(function(content) {
      return {
        path: path,
        content: content
      };
    });
  }

  function startEditor(path) {
    return new Promise(function(resolve, reject) {
      var editorProcess = spawn(process.env.EDITOR, [path], {stdio: 'inherit'});
      editorProcess.on('close', function(code) {
        if (code === 0) {
          resolve(path);
        } else {
          reject(new Error('Editor process ended with status code: %s', code));
        }
      });
    });
  }

  module.exports.startEditor = function(content, callback) {
    return createTempFile(content)
    .then(startEditor)
    .then(readTmpFile)
    .then(function(fileInfo) {
      return deleteTempFile(fileInfo.path)
      .then(_.constant(fileInfo.content));
    });
  };
})();
