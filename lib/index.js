var argv = require('optimist').argv;

var commands = ['new', 'edit', 'ls', 'cat', 'rm'];

var executedCommand = argv._[0];
if (commands.indexOf(executedCommand) === -1) {
  console.error('Unrecognized command: '  + executedCommand);
  process.exit(1);
}

require('./' + executedCommand)(argv);
