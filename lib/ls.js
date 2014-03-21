var _ = require('underscore');
var colors = require('colors');
var moment = require('moment');
var S = require('string');
var storage = require('./storage');
var table = require('./table');
var util = require('./util');

function getCategory(note) {
  return note.category || 'uncategorized';
}

var colorize = {
  category: function(s) {
    return s.grey;
  },

  header: function(s, columnIndex) {
    return s.grey;
  },

  cell: function(s, rowIndex, columnIndex) {
    return s;
  }
}

module.exports = function(argv) {
  storage.list()
  .then(function(list) {
    if (list.length === 0) {
      console.log('There are no notes.');
      return;
    }

    // first, let's determine all the categories that we will have
    var categories = _.chain(list)
      .map(getCategory)
      .uniq()
      .filter(_.isString)
      .reject(_.isEmpty)
      .value();

    // now create a mapping for 'category => [note, note]'. We do this in
    // two steps to avoid the typical 'is category already in map if'.
    var categorizedNotes = categories.reduce(function(accu, category) {
      accu[category] = [];
      return accu;
    }, {});

    // this is the second step - fill the previously created lists
    list.forEach(function(note) {
      categorizedNotes[getCategory(note)].push(note);
    });

    // Use the previously generated mapping to map sure that each
    // category is sorted and map notes to rows.
    categorizedNotes = categories.reduce(function(accu, category) {
      var sortedNotes = _.sortBy(categorizedNotes[category], 'modified')
        .reverse();
      accu[category] = sortedNotes.map(function(note) {
        var row = [
          util.toShortId(note.id),
          S(note.title).truncate(50).s,
          note.modified.fromNow()
        ];
        return row;
      });
      return accu;
    }, {})

    var header = ['ID', 'Title', 'Last Modification'];

    table(header, categorizedNotes, colorize);
  })
  .catch(function(error) {
    console.error('Failed to create note listing', error);
  });
};
