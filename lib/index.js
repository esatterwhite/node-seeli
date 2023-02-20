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

const colors = [
  'red', 'blue', 'green'
, 'yellow', 'bold', 'grey'
, 'dim', 'black', 'magenta'
, 'cyan', 'redBright', 'blueBright'
, 'greenBright', 'yellowBright', 'cyanBright'
]

module.exports = commands

commands.Seeli = Seeli

Object.defineProperties(commands, {
  Seeli: {
    get: () => {
      return Seeli
    }
  }
, Command: {
    get: () => {
      return Command
    }
  }
, list: {
    get: () => {
      return Array.from(commands.names)
    }
  }
})

colors.forEach((color) => {
  module.exports[color] = chalk[color]
})
