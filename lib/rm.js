var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  var note = util.findNoteById(argv, 'rm');
  var content = storage.remove(note.id);
  console.log('Note \'%s\' removed.', note.title);
};
