var _ = require('underscore');
var childProcess = require('child_process');
var fs = require('fs');
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

(function() {
  function createTempFile(content) {
    var name = 'postit-' + uuid.v4() + '.md';
    var path = '/tmp/' + name;
    fs.writeFileSync(path, content || '', 'UTF-8');
    return path;
  }

  function deleteTempFile(path) {
    fs.unlink(path);
  }

  function startEditor(path) {
    var editor = process.env.EDITOR;
    var editorProcess = childProcess.spawn(editor, [path], {stdio: 'inherit'});
    return editorProcess;
  }

  module.exports.startEditor = function(content, callback) {
    var tmpFile = createTempFile(content);
    var editorProcess = startEditor(tmpFile);
    editorProcess.on('close', function(code) {
      var content = fs.readFileSync(tmpFile, 'UTF-8');
      deleteTempFile(tmpFile);
      callback(code === 0, content);
    });
  };
})();
