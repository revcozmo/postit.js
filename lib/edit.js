var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  var note = util.findNoteById(argv, 'edit');
  storage.content(note.id, function(error, content) {
    if (error) {
      console.error('Failed to retrieve note content: %s', error);
      process.exit(1);
    }

    util.startEditor(content, function(success, newContent) {
      if (success) {
        if (content === newContent) {
          console.log('Note unmodified. Skipping update.');
          return;
        }
        
        storage.edit(note.id, newContent, function(error) {
          if (error) {
            console.error('Failed to write updated note: %s', error);
            process.exit(1);
          }
          console.log('Updated note \'%s\'.', note.title);
        });
      } else {
        console.log('Abort: Not saving edited note \'%s\'', note.title);
      }
    });
  });
};
