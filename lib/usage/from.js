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
  const required_with_ui = cliui()
  const required_without_ui = cliui()
  const requires_one_ui = cliui()
  const style = plain ? noop : colorize
  const {flags, interactive, requires_one} = command.options

  for (const [flag, config] of Object.entries(flags)) {
    if (flag === 'interactive' && !interactive) continue
    const type = typeOf(config.type)
    let flag_text = util.format(
      '--%s%s <%s>'
    , flag
    , type === 'boolean'
        ? `, --no-${flag}`
        : ''
    , style(type)
    )
    if (config.required) {
      flag_text += ` ${chalk.bold('(required)')}`
    }
    ui.div(
      {
        text: config.shorthand
          ? `-${config.shorthand}, `
          : ''
      , padding: [0, 0, 0, 2]
      , align: 'left'
      , width: 6
      }
    , {
        text: flag_text
      , align: 'left'
      , width: 40
      }
    , {
        text: isUndef(config.default)
          ? ''
          : `[${chalk.bold(config.default)}]`
      , align: 'left'
      , width: 14
      }
    , {
        text: config.description || ''
      , align: 'left'
      , width: Math.max(80, width((config.description || '').trim()))
      }
    )

    if (config.required_with) {
      required_with_ui.div({
        text: style(`* ${flag}, ${config.required_with.join(', ')}`)
      , padding: [0, 0, 0, 2]
      })
    }
    if (config.required_without) {
      required_without_ui.div({
        text: style(`* ${flag}, ${config.required_without.join(', ')}`)
      , padding: [0, 0, 0, 2]
      })
    }
  }

  if (requires_one) {
    requires_one_ui.div({
      text: style(`* ${requires_one.join(', ')}`)
    , padding: [0, 0, 0, 2]
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
  if (required_with_ui.rows.length) {
    output.push(`${os.EOL}Mutually Inclusive Flags:`)
    output.push(required_with_ui)
  }
  if (required_without_ui.rows.length) {
    output.push(`${os.EOL}Mutually Exclusive Flags:`)
    output.push(required_without_ui)
  }
  if (requires_one_ui.rows.length) {
    output.push(`${os.EOL}Only 1 may have a value:`)
    output.push(requires_one_ui)
  }

  return output
}

function noop(txt) {
  return txt
}
