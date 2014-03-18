var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  util.findNoteById(argv, 'cat')
  .then(function(note) {
    return storage.content(note.id);
  })
  .then(console.log.bind(console))
  .catch(function(error) {
    console.error('Failed to retrieve note contents:', error);
    process.exit(1);
  });
};
