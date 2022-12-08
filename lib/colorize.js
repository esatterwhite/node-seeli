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
const {InvalidColorModeException} = require('./exceptions')

module.exports = colorize

const MODES = new Set(['hex', 'ansi256'])

function colorize(txt, override) {
  let mode = null
  let value = null
  const key = override || conf.get('color') || 'green'
  const parsed = key.split(':')

  if (parsed.length === 1) {
    value = parsed[0]
  } else {
    mode = parsed[0]
    value = parsed[1]
  }

  if (mode && !MODES.has(mode)) {
    throw new InvalidColorModeException(
      `Invalid color mode: ${mode}`
    , Array.from(MODES)
    )
  }

  const color = mode ? chalk[mode](value) : chalk[value]

  if (!color) return txt
  return color(txt)
}
