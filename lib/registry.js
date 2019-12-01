'use strict';
/**
 * Command this for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 9.0.0
 * @requires abbrev
 * @requires seeli/lib/conf
 * @requires mout/lang/toArray
 * @requires mout/object/fillIn
 */
var abbrev   = require('abbrev')
  , debug    = require('debug')('seeli:commands')
  , hasOwn   = require('mout/object/hasOwn')
  , toArray  = require('mout/lang/toArray')
  , fill     = require('mout/object/fillIn')
  , conf     = require('./conf')
  , typeOf   = require('./usage/type-of')
  ;

class Registry {

  register(name, cmd) {
    let _name = name
    let _command = cmd

    const is_command = typeOf(name) === 'command'
    if (is_command) {
      _command = _name
      _name = _command.options.name
    }
    const abbrevs = abbrev(_name);
    const alias = _command.options.alias;

    if (alias) {
      debug('registering %s with aliases', _name, alias);
      for (const abbr of toArray(alias)) {
        fill(abbrevs, abbrev(abbr));
      }
    }
    // generate short hand commands
    // that are accessable but not enumerable.
    // really just for typo support.
    Object.keys(abbrevs).forEach((abbr) => {
      if(!hasOwn(this, abbr)) {
        Object.defineProperty(this, abbr, {
          enumerable: abbr == _name ? true : false
        , configurable: true
        , get: () => {
            return _command;
          }
        , set: function( val ){
            _command = val;
          }
        });
      }
    });
  }

  unregister (name) {
    var cmd = this[ name ];
    if( cmd ){
      cmd.removeAllListeners();
      cmd.reset();
      delete this[ name ];
      cmd = null;
    }

    return this;
  }

  /**
   * @memberof module:seeli/lib/commands
   * @property {Array} list A list of all registered commands
   **/
  list () {
      return Object.keys( this );
  }

  /**
   * Unregisters all commands
   * @static
   * @name reset
   * @function
   * @memberof module:seeli/lib/commands
   **/
  reset() {
    for(var key in this ){
      this.unregister( key );
    }
    this.register('help', require( conf.get('help') ) );
    return this;
  }

}

module.exports = Registry;
