var _ = require('underscore');
var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  util.findNoteById(argv, 'rm')
  .then(function(note) {
    return storage.remove(note.id)
    .then(function() {
      console.log('Note \'%s\' removed.', note.title);
    });
  })
  .catch(function(error) {
    console.error('Failed to remove note: ', error);
    process.exit(1);
  })
};
