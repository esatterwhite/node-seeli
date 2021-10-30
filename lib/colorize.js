'use strict'

/**
 * shortcut function to colorize a string using the globally configured color
 * @module module:seeli/lib/colorize
 * @author Eric Satterwhite
 * @requires chalk
 * @requires seeli/lib/conf
 **/
const chalk = require('chalk')
const conf = require('./conf')

module.exports = colorize

function colorize(txt, override) {
  const color = chalk[override || conf.get('color')] || chalk.green
  if (!color) return txt
  return color(txt)
}
