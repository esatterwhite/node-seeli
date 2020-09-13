/* eslint-disable consistent-this */
'use strict'
/**
 * Built in command for constructing help for seeli and all registered commands
 * @module module:seeli/lib/commands/help
 * @author Eric Satterwhite
 * @requires os
 * @requires seeli/lib/command
 * @requires seeli/lib/usage/list
 * @requires seeli/lib/colorize
 **/
const os = require('os')
const Command = require('../command')
const conf = require('../conf')
const colorize = require('../colorize')
const list = require('../usage/list')

const NAME = conf.get('name')

/**
 * @singleton
 * @alias module:seeli/lib/commands/help
 */
module.exports = new Command({
  description: 'Displays information about available commands'
, interactive: false
, usage: [
    `${colorize(NAME)} help <${colorize('command')}>`
  , `${colorize(NAME)} <${colorize('command')}> --help`
  ]
, alias: ['hlep']
, run: async function(cmd, registry) {
    if (!cmd) return list()
    const commands = require('./')
    const cls = commands[ cmd ]

    const instance = cmd === 'help'
      ? this
      : typeof cls === 'function' ? new cls() : cls

    let help = [instance.description]
    try {
      let breaker = ''
      let len = instance.description.length

      while (len--) {
        breaker += '='
      }
      help.push(breaker, instance.usage)
      help = help.join(os.EOL)
    } catch (e) {
      help = `no help found for ${cmd}`
    }
    return help
  }
})

