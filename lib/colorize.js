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

function colorize(txt) {
  const color = chalk[conf.get('color')]
  if (!color) return txt
  return color(txt)
}
