var commands = ['new', 'edit', 'ls', 'cat', 'rm'];

var argv = process.argv.slice(2);

if (argv.length === 0) {
  console.error('Please specify a command to execute.');
  process.exit(1);
}

var executedCommand = argv[0];
if (commands.indexOf(executedCommand) === -1) {
  console.error('Unrecognized command: '  + executedCommand);
  process.exit(1);
}

require('./' + executedCommand)(argv);
