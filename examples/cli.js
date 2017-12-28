/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
const cli = require('../')
const commands = require('./commands')
cli.set({
  exitOnError: true
, color: 'green'
, name: 'example'
})

for (const [name, command] of Object.entries(commands)) {
  cli.use(name, command)
}

cli.run();
