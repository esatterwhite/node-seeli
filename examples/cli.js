#!/usr/bin/env node

'use strict'
const cli = require('../')

cli.set({
  exitOnError: false
, color: 'green'
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

if (require.main === module) cli.run()

module.exports = cli
