'use strict'
/**
 * CLI harness module. Comes with free help command
 * @module seeli
 * @author Eric Satterwhite
 * @requires nopt
 * @requires util
 * @requires chaolk
 * @requires os
 * @requires seeli/lib/command
 * @requires seeli/lib/commands
 * @requires seeli/lib/conf
 **/
const nopt = require('nopt')
const chalk = require('chalk')
const command = require('./command')
const commands = require('./commands')
const colorize = require('./colorize')
const conf = require('./conf')

const colors = [
  'red', 'blue', 'green'
, 'yellow', 'bold', 'grey'
, 'dim', 'black', 'magenta'
, 'cyan', 'redBright', 'blueBright'
, 'greenBright', 'yellowBright', 'cyanBright'
]

let parsed

// primary flags
const opts = {
  help: Boolean
, traceback: Boolean
}

// flag alias
const shorthands = {
  h: ['--help']
}

module.exports = {
/**
 * Registers a command by name
 * @static
 * @method module:seel#use
 * @param {String} name Registered name of the command
 * @param {module:seel/lib/command} Command the Command to execute by name
 **/
  use: commands.register.bind(commands)
/**
 * @readonly
 * @name Command
 * @memberof seeli
 * @property {module:seel/lib/command} Command Short cut to the primary commadn class
 **/
, Command: command
/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
, get: conf.get
/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
, set: conf.set
/**
 * starts the command line execution process
 **/
, run: run
, commands: commands
, reset: commands.reset.bind(commands)
/**
 * colorizes a given string using the chalk color found in local configuration
 * @param {String} text A string to wrap in an ansi color
 * @returns {String} The given string wrapped in the configued ansi color
 * @example
 * const seeli = require('seeli')
 * seeli.set('color', 'blue')
 * seeli.colorize('I am blue')
 **/
, colorize: colorize
}

colors.forEach((color) => {
  module.exports[color] = chalk[color]
})

Object.defineProperties(module.exports, {
  /**
   * @readonly
   * @name list
   * @memberof seeli
   * @property {Array} list returns a list of registered commands
   **/
  list: {
    get: function() {
      return Object.keys(commands)
    }
  }
})

function run() {
  parsed = nopt(opts, shorthands)

  // pull out the first non-flag argument
  let cmd = parsed.argv.remain.shift()
  // did the try to use the help command directly?
  const help = !!parsed.help
  if (help || cmd === 'help' || cmd == null) {
    // allow for abbreviated commands
    cmd = (cmd === 'help' || cmd == null) ? parsed.argv.remain.shift() : cmd
    return commands.help.run(cmd).then(onComplete).catch(onError)
  }

  if (commands.hasOwnProperty(cmd)) {
    return commands[cmd].run(null).then(onComplete).catch(onError)
  }

  console.error('unknown command %s', cmd)
  console.error('known commands: %s ', Object.keys(commands).join(', '))
}

function onError(err) {
  console.error(`${chalk.red(err.name)}: ${err.message}`)
  if (parsed && parsed.traceback) {
    console.error(chalk.bold(chalk.red(err.stack)))
  } else {
    console.error('use --traceback for full stacktrace')
  }
  const code = isFinite(err.code) ? err.code : 1

  if (conf.get('exitOnError')) {
    process.exit(code)
    return
  }
  process.exitCode = code
}

function onComplete(content) {
  if (typeof content === 'string') console.log(content)
  if (conf.get('exitOnContent')) process.exit(0)
}
