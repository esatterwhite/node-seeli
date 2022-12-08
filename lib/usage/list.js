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
const colorize = require('../colorize')
const usage = chalk.white.bold

module.exports = list

function list(commands) {
  const registry = commands || require('../commands')

  try {
    const descriptions = []
    for (const name of registry.names) {
      const cmd = registry.get(name)
      descriptions.push(
        `${usage('* ')} ${colorize(name)} - ${cmd.description}`
      )
    }
    const content = [
      `${usage('Usage: ')} ${conf.get('name')} <${colorize('command')}> [options]`
    , ''
    , 'Where <command> is the name the command to execute'
    , descriptions.join(os.EOL)
    ].join(os.EOL)
    return content
  } catch (e) {
    return chalk.red(`CLI error: ${e.message}`)
  }
}
