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
const chalk = require('chalk')
const conf = require('../conf')
const usage = chalk.white.bold

module.exports = list

function list(commands) {
  const registry = commands || require('../commands')
  const color = chalk[conf.get('color')] || noop

  try {
    const descriptions = []
    for (const name of registry.names) {
      const cmd = registry.get(name)
      descriptions.push(
        `${usage('* ')} ${color(name)} - ${cmd.description}`
      )
    }
    const content = [
      `${usage('Usage: ')} ${conf.get('name')} <${color('command')}> [options]`
    , ''
    , 'Where <command> is the name the command to execute'
    , descriptions.join(os.EOL)
    ].join(os.EOL)
    return content
  } catch (e) {
    return chalk.red(`CLI error: ${e.message}`)
  }
}

function noop(txt) {
  return txt
}
