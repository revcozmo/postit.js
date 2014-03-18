var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');
var Promise = require('es6-promise').Promise;
var storage = require('./storage');
var uuid = require('node-uuid');

module.exports.toShortId = function(id) {
  return id.substring(0, 8);
};

module.exports.findNoteById = function(argv, commandName) {
  if (argv._.length < 2) {
    console.error('%s requires the note ID as the second parameter.',
      commandName);
    process.exit(1);
  }

  var id = argv._[1];
  var note = _.find(storage.list(), function(note) {
    return note.id.indexOf(id) === 0
  });

  if (!note) {
    console.error('A note with ID %s could not be found.', id);
    process.exit(1);
  }

  return note;
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
