'use strict'

const cli = require('../../../')

module.exports = new cli.Command({
  name: 'hub'
, description: 'Do sub hub type things'
, usage: [
    `${cli.colorize(cli.get('name'))} sub hub`
  ]
, flags: {
    ask: {
      'type': Boolean
    , 'default': true
    , 'description': 'do you like hub'
    }
  }
, async run(cmd, data) {
    return 'hub'
  }
})

