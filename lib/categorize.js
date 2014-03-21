var _ = require('underscore');
var storage = require('./storage');
var util = require('./util');

module.exports = function(argv) {
  util.findNote(argv, 'categorize')
  .then(function(note) {
    if (argv.length < 3) {
      throw new Error('The categorize command expects the category name ' +
        'after the note identifier.');
    }

    var category = argv.slice(2).join(' ');
    return storage.categorize(note.id, category)
    .then(function() {
      console.log('Successfully categorized \'%s\' under \'%s\'.',
        note.title, category);
    });
  })
  .catch(function(error) {
    console.error('Failed to categorize note:', error);
  });
};
