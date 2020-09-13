/* jshint laxcomma: true, smarttabs: true, node: true, esnext: true*/
'use strict'

/**
 * Generats a user friendly list of available commands
 * @module seeli/lib/usage/list
 * @author Eric Satterwhite
 * @since 7.0.0
 * @requires os
 * @requires util
 * @requires chalk
 * @requires seeli/lib/conf
 **/
const os = require('os')
const util = require('util')
const chalk = require('chalk')
const conf = require('../conf')
const usage = chalk.white.bold
const noop = (txt) => { return txt }

module.exports = list

function list() {
  const commands = require('../commands')
  const color = chalk[ conf.get('color') ] || noop

  try {
    const content = [
      `${usage('Usage: ')} ${conf.get('name')} <${color('command')}> [options]`
    , ''
    , 'Where <command> is the name the command to execute'
    , util.format('%s', Object.keys(commands).map((name) => {
        return `${usage('* ')} ${color(name)} - ${commands[name].description}`
      }).join(os.EOL))
    ].join(os.EOL)
    return content
  } catch (e) {
    return chalk.red(`CLI error: ${e.message}`)
  }
}
