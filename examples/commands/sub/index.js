'use strict'

const cli = require('../../../')
const name = cli.colorize(cli.get('name'))
module.exports = new cli.Command({
  name: 'sub'
, description: 'Attempt subcommands'
, usage: [
    `${name} sub <action>`
  , `${name} sub hub`
  , `${name} sub bub --no-ask`
  ]
, commands: [
    require('./hub')
  , require('./bub')
  ]
, async run() {
    return this.usage
  }
})
