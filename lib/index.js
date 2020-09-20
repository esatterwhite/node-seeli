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
const chalk = require('chalk')
const Command = require('./command')
const Seeli = require('./seeli')
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
, Command: Command
, Seeli: Seeli
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
, plugin: commands.plugin.bind(commands)
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
, get list() {
    return Array.from(commands.names)
  }
}

colors.forEach((color) => {
  module.exports[color] = chalk[color]
})

function run() {
  return commands.run()
}
