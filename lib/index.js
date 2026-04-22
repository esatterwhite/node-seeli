'use strict'
/**
 * CLI harness module. Comes with free help command
 * @module seeli
 * @author Eric Satterwhite
 * @requires nopt
 * @requires util
 * @requires chalk
 * @requires os
 * @requires seeli/lib/command
 * @requires seeli/lib/commands
 * @requires seeli/lib/conf
 **/
const {default: chalk} = require('chalk')
const Command = require('./command')
const Seeli = require('./seeli')
const commands = require('./commands')

/**
 * Array of available chalk colors
 * @type {string[]}
 */
const colors = [
  'red', 'blue', 'green'
, 'yellow', 'bold', 'grey'
, 'dim', 'black', 'magenta'
, 'cyan', 'redBright', 'blueBright'
, 'greenBright', 'yellowBright', 'cyanBright'
]

module.exports = commands

/**
 * Seeli class constructor
 * @name Seeli
 * @type {typeof import('./seeli')}
 * @memberof module:seeli
 */
commands.Seeli = Seeli

/**
 * Define property accessors for module exports
 */
Object.defineProperties(commands, {
  Seeli: {
    /**
     * Get the Seeli class
     * @returns {typeof Seeli} The Seeli class
     */
    get: () => {
      return Seeli
    }
  }
, Command: {
    /**
     * Get the Command class
     * @returns {typeof Command} The Command base class
     */
    get: () => {
      return Command
    }
  }
, list: {
    /**
     * Get list of registered command names
     * @returns {string[]} Array of command names
     */
    get: () => {
      return Array.from(commands.names)
    }
  }
})

// Add chalk color functions to module exports
colors.forEach((color) => {
  module.exports[color] = chalk[color]
})
