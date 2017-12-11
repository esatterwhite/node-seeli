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

const os     = require('os');
const util   = require('util');
const chalk  = require('chalk');
const typeOf = require('./type-of');
const conf   = require('../conf');
const noop   = (txt) => { return txt }

module.exports = from

function from( flags, plain ){
  const return_value = [''];
  const style = !!plain ? noop : chalk[conf.get('color')] || chalk.green;

  for( const flag in flags ) {
    const config = flags[flag];
    const type = typeOf( config.type );
    return_value.push(util.format(
      '%s--%s%s <%s> %s %s'
    , config.shorthand ? `-${config.shorthand}, ` : ''
    , flag
    , type === 'boolean' ? `, --no-${flag}` : ''
    , style(type)
    , typeof config.default === 'undefined' ? '' : `[${chalk.bold( config.default )}]`
    , config.description || ''
    ));
  }
  return_value.push('', `${style('<...>')}: input type | ${style('*')}: repeatable flags | ${style("[...]")}: default values` );
  return return_value.join( os.EOL + '  ' );
}
