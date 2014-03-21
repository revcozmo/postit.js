var _ = require('underscore');
var S = require('string');

var CONTENT_ROW_PREFIX = '  ';
var CELL_SEPARATOR = '   ';

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

module.exports = function(header, categorizedRows, colorize) {
  var uncategorizedRows = _.flatten(_.values(categorizedRows), true);
  uncategorizedRows.push(header);
  var maxCellWidths = getMaxColumnsLengths(uncategorizedRows);
  var categories = Object.keys(categorizedRows).sort();

  var write = process.stdout.write.bind(process.stdout);
  var nl = write.bind(null, '\n');

  write(CONTENT_ROW_PREFIX);
  for (var hi = 0; hi < header.length; hi++) {
    var padded = S(header[hi]).padRight(maxCellWidths[hi]).s;
    var colorized = colorize.header(padded, hi);
    write(colorized);
    write(CELL_SEPARATOR);
  }
  nl();
  nl();

  categories.forEach(function(category) {
    write(colorize.category(category));
    nl();

    var rows = categorizedRows[category];

    for (var ri = 0; ri < rows.length; ri++) {
      var columns = rows[ri];
      write(CONTENT_ROW_PREFIX);
      for (var ci = 0; ci < columns.length; ci++) {
        var column = columns[ci];
        var colorized = colorize.cell(column, ri, ci);
        write(S(colorized).padRight(maxCellWidths[ci]).s);
        write(CELL_SEPARATOR);
      }
      nl();
    }

    nl();
  })

};
