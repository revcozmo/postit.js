var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  var note = util.findNoteById(argv, 'cat');
  storage.content(note.id, function(error, content) {
    if (error) {
      console.error('Error while trying to retrieve content for %s', note.id);
      process.exit(1);
    } else {
      console.log(content);
    }
  });
};
