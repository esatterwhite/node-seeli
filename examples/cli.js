/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
const cli = require('../')
cli.set({
  exitOnError: true
, color: 'blue'
, name: 'example'
})

const commands = require('./commands')
for (const [name, command] of Object.entries(commands)) {
  cli.use(name, command)
}

cli.run();
