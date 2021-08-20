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
const HELP_REGEX = /help|hlep/

/**
 * @singleton
 * @alias module:seeli/lib/commands/help
 */
module.exports = new Command({
  description: 'Displays information about available commands'
, name: 'help'
, get usage() {
    return [
      `${conf.get('name')} help <${colorize('command')}>`
    , `${conf.get('name')} <${colorize('command')}> --help`
    ]
  }
, alias: ['hlep']
, run: async function(cmd, argv) {
    if (!cmd) return list()

    const lookup = argv.argv.remain.filter((arg) => {
      return !HELP_REGEX.test(arg)
    })

    const commands = require('./')
    let cls = lookup.length
      ? commands.resolve(lookup)
      : commands.get(cmd)

    let output = []
    if (cls === undefined && lookup.length) {
      while (cls === undefined && lookup.length) {
        // This means the last lookup failed.
        // So, pop it off
        const bad_command = lookup.pop()
        const pre_command = conf.get('name') + ' ' + lookup.join(' ')
        const len = pre_command.length + 1
        output = [
          'Invalid command:'
        , ''
        , `$ ${pre_command} ${this.colorize('red', bad_command)}`
        , '-'.repeat(len + 2) + '^'.repeat(bad_command.length)
        , ''
        , `Below is the usage for ${this.colorize('bold', pre_command)}:`
        , ''
        ]

        cls = commands.resolve(lookup)
      }
    }

    const instance = HELP_REGEX.test(cmd)
      ? this
      : typeof cls === 'function' ? new cls() : cls

    output.push(instance.description)

    try {
      const breaker = '='.repeat(instance.description.length)
      output.push(breaker, instance.usage)
      output = output.join(os.EOL)
    } catch (e) {
      output = `no help found for ${cmd}`
      console.error(e)
    }
    return output
  }
})

