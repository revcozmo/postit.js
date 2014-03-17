var colors = require('colors');
var moment = require('moment');
var S = require('string');
var storage = require('./storage');
var table = require('./table');
var util = require('./util');

module.exports = function(argv) {
  var notes = storage.list();
  if (notes.length === 0) {
    console.log('There are no notes.');
    return;
  }

  var rows = storage.list().map(function(entry) {
    return [
      util.toShortId(entry.id),
      S(entry.title).truncate(50).s,
      moment(entry.modified).fromNow()
    ];
  });
  rows.unshift(['ID', 'Title', 'Last Modification']);
  table(rows, function(s, row, column) {
    if (row === 0) {
      return s.cyan.bold;
    }
    return s;
  });
};
