'use strict'

/**
 * Function to generate help text from a set of command flags
 * @author Eric Satterwhite
 * @since 7.0.0
 * @module seel/lib/usage/from
 * @requires os
 * @requires util
 * @requires chalk
 * @requires seeli/lib/usage/type-of
 * @requires seel/lib/conf
 * @example const output = usage.from(cmd.options.flags)
 * console.log(output)
 **/

const os = require('os')
const cliui = require('cliui')
const util = require('util')
const chalk = require('chalk')
const width = require('string-width')
const toArray = require('mout/lang/toArray')
const isUndef = require('mout/lang/isUndefined')
const typeOf = require('./type-of')
const colorize = require('../colorize')

module.exports = from

function from(command, plain) {
  const output = [...toArray(command.options.usage)]


  const acts = actions(command, plain)
  const opts = options(command, plain)

  output.push(
    ...acts
  , ...opts
  )

  return output.join(os.EOL)
}

function actions(command, plain) {
  const acts = []
  const style = !!plain ? noop : colorize

  if (command.names.size) {
    acts.push(
      ''
    , 'Actions:'
    , '--------'
    )

    for (const name of command.names) {
      const cmd = command.get(name)
      acts.push(
        `  * ${style(name)} - ${cmd.description}`
      )
    }
  }

  return acts
}

function options(command, plain) {
  const ui = cliui()
  const style = !!plain ? noop : colorize
  const {flags, interactive} = command.options

  for (const [flag, config] of Object.entries(flags)) {
    if (flag === 'interactive' && !interactive) continue
    const type = typeOf(config.type)
    ui.div({
      text: util.format(
        '%s--%s%s'
      , config.shorthand
          ? `-${config.shorthand}, `
          : ''
      , flag
      , type === 'boolean'
          ? `, --no-${flag}`
          : ''
      )
    , padding: [0, 0, 0, 2]
    , width: 40
    }, {
      text: `<${style(type)}>`
    , align: 'left', width: 10
    }, {
      text: isUndef(config.default)
        ? ''
        : `[${chalk.bold(config.default)}]`
    , align: 'left'
    , width: 20
    }, {
      text: config.description || ''
    , align: 'left'
    , width: Math.max(80, width((config.description || '').trim()))
    })
  }

  ui.div({
    text: [
      `${style('<...>')}: input type`
    , `${style('*')}: repeatable flags`
    , `${style('[...]')}: default values`
    ].join(' | ')
  , padding: [2, 0, 0, 2]
  })
  const output = []

  if (ui.rows) {
    output.push(`${os.EOL}Options:${os.EOL}`)
    output.push(ui)
  }
  return output
}

function noop(txt) {
  return txt
}
