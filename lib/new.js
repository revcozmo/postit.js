var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  if (argv._.length < 2) {
    console.error('Please specify a note name.');
    process.exit(1);
  }
  var title = argv._.slice(1).join(' ');

  util.startEditor('', function(success, content) {
    if (success) {
      storage.store(title, content, function(error, id) {
        if (error) {
          console.error('Failed to write note:\n%s', error);
        } else {
          console.log('New Note \'%s\' with ID \'%s\'.', title, id);
        }
      });
    } else {
      console.log('Abort: Not saving new note \'%s\'.', title);
    }
  });
};
