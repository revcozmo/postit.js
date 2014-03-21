var _ = require('underscore');
var colors = require('colors');
var moment = require('moment');
var S = require('string');
var storage = require('./storage');
var table = require('./table');
var util = require('./util');

module.exports = function(argv) {
  storage.list()
  .then(function(list) {

    list = _.sortBy(list, 'modified').reverse();

    if (list.length === 0) {
      console.log('There are no notes.');
      return;
    }
    var rows = list.map(function(entry) {
      return [
        util.toShortId(entry.id),
        S(entry.title).truncate(50).s,
        entry.modified.fromNow()
      ];
    });
    rows.unshift(['ID', 'Title', 'Last Modification']);
    table(rows, function(s, row, column) {
      if (row === 0) {
        return s.cyan.bold;
      }
      return s;
    });
  })
  .catch(function(error) {
    console.error('Failed to create note listing', error);
  });
};
