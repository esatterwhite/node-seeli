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

const cliui  = require('cliui');
const util   = require('util');
const chalk  = require('chalk');
const width  = require('string-width');
const typeOf = require('./type-of');
const conf   = require('../conf');
const noop   = (txt) => { return txt; };

module.exports = from;

function from (flags, plain, interactive = true)  {
  const ui = cliui();
  const style = !!plain ? noop : chalk[conf.get('color')] || chalk.green;

  for( const flag in flags ) {
    if (flag === 'interactive' && !interactive) continue
    const config = flags[flag];
    const type = typeOf( config.type );
    ui.div({
      text: util.format(
        '%s--%s%s'
      , config.shorthand ? `-${config.shorthand}, ` : ''
      , flag
      , type === 'boolean' ? `, --no-${flag}` : ''
      )
    , padding: [0, 0, 0, 2]
    , width: 40
    }, {
      text: `<${style(type)}>`
    , align: 'left', width: 10
    }, {
      text: typeof config.default === 'undefined' ? '' : `[${chalk.bold( config.default )}]`
    , align: 'left'
    , width: 20
    }, {
      text: config.description || ''
    , align: 'left'
    , width: Math.max(80, width((config.description || '').trim()))
    });
  }

  ui.div({
    text: `${style('<...>')}: input type | ${style('*')}: repeatable flags | ${style("[...]")}: default values`
  , padding: [2, 0, 0, 2]
  });

  return ui.toString();
}
