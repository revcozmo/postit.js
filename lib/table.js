var S = require('string');

var COLUMN_SEPARATOR = '   ';

function getLength(s) {
  return s ? s.length : 0;
}

function getMaxColumnsLengths(rows) {
  return rows.reduce(function(max, columns) {
    return columns.map(function(column, i) {
      return Math.max(getLength(column), max[i] !== undefined ? max[i] : 0);
    });
  }, []);
}

module.exports = function print(rows, colorize) {
  var max = getMaxColumnsLengths(rows);

  var write = process.stdout.write.bind(process.stdout);

  for (var r = 0; r < rows.length; r++) {
    var columns = rows[r];
    for (var c = 0; c < columns.length; c++) {
      var column = columns[c];
      write(colorize(S(column).padRight(max[c]).s, r, c));
      write(COLUMN_SEPARATOR);
    }
    write('\n');
  }
}
