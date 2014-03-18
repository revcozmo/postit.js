var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  if (argv._.length < 2) {
    console.error('Please specify a note title.');
    process.exit(1);
  }
  var title = argv._.slice(1).join(' ');

  util.startEditor('')
  .then(function(content) {
    storage.store(title, content, function(error, id) {
      if (error) {
        console.error('Failed to write note:\n%s', error);
      } else {
        console.log('New Note \'%s\' with ID \'%s\'.', title, id);
      }
    });
  })
  .catch(function(error) {
    console.error(error);
    process.exit(1);
  });
};
