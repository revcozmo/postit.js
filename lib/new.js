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
    return storage.store(title, content);
  })
  .then(function(id) {
    console.log('New Note \'%s\' with ID \'%s\'.', title, id);
  })
  .catch(function(error) {
    console.error(error);
    process.exit(1);
  });
};
