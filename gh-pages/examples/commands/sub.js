'use strict'

const seeli = require('seeli')
const name = seeli.colorize(seeli.get('name'))

const bar = new seeli.Command({
  name: 'bar'
, description: 'A Bar Command'
, usage: [
    `${name} foo bar --input=yes`
  ]
, flags: {
    input: {
      type: String
    , description: 'A bar value'
    }
  }
, run: async () => {
    return 'bar'
  }
})

// main command
module.exports = new seeli.Command({
  name: 'foo'
, description: 'A Foo command'
, usage: [
    `${name} foo <action> [flags]`
  , ...bar.usage
  ]
, commands: [bar]
, run: async function(cmd, data) {
    const help = seeli.commands.get('help')
    return help.run('foo')
  }
})
