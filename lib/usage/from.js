/*jshint laxcomma: true, smarttabs: true, node: true, esnext: true*/
'use strict';

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

const os     = require('os');
const ui     = require('cliui')()
const util   = require('util');
const chalk  = require('chalk');
const typeOf = require('./type-of');
const conf   = require('../conf');
const noop   = (txt) => { return txt; };

module.exports = from;

function from( flags, plain ){
  const return_value = [''];
  const style = !!plain ? noop : chalk[conf.get('color')] || chalk.green;

  for( const flag in flags ) {
    const cols = []
    const config = flags[flag];
    const type = typeOf( config.type );
    cols.push({
      text: util.format(
        '%s--%s%s'
      , config.shorthand ? `-${config.shorthand}, ` : ''
      , flag
      , type === 'boolean' ? `, --no-${flag}` : ''
      )
    , padding: [0, 0, 0, 2]
    , width: 40
    })
    cols.push({text: `<${style(type)}>`, align: 'left', width: 10})

    cols.push({
      text: typeof config.default === 'undefined' ? '' : `[${chalk.bold( config.default )}]`
    , align: 'left'
    , width: 20
    })
    cols.push({
      text: config.description || ''
    , align: 'left'
    })
    ui.div(...cols)
  }
  ui.div({text: `${style('<...>')}: input type | ${style('*')}: repeatable flags | ${style("[...]")}: default values`, padding: [2, 0, 0, 2] });
  return ui.toString();
}
