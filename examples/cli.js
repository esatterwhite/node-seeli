/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
const cli = require('../')
cli.set({
  exitOnError: true
, color: 'blue'
, name: 'example'
})

const commands = require('./commands')
for (const [name, command] of Object.entries(commands)) {
  if (command.options.name) {
    cli.use(command)
  } else {
    cli.use(name, command)
  }
}

cli.run();
