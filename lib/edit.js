var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  util.findNote(argv, 'edit')
  .then(function(note) {
    return storage.content(note.id)
    .then(function(content) {
      return util.startEditor(content);
    })
    .then(function(content) {
      return storage.edit(note.id, content);
    })
    .then(function() {
      console.log('Updated note \'%s\'.', note.title);
    })
  })
  .catch(function(error) {
    console.error('Failed to edit note:', error);
    process.exit(1);
  });
};
