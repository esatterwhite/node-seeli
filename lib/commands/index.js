/*jshint laxcomma: true, smarttabs: true, node: true, unused: true*/
'use strict';
/**
 * Command registry for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires os
 * @requires abbrev
 * @requires seeli/lib/conf
 * @requires mout/array/comine
 */
const abbrev   = require("abbrev")
    , debug    = require('debug')('seeli:commands')
    , toArray  = require('mout/lang/toArray')
    , fill     = require('mout/object/fillIn')
    , conf     = require('../conf')
    , typeOf   = require('../usage/type-of')
    , registry = {}
  ;

Object.defineProperties(registry, {

  register: {
    enumerable: false
    /**
     * Register a command by name
     * @function
     * @name register
     * @static
     * @memberof module:seeli/lib/commands
     * @param {String} name
     * @param {module:seeli/lib/command} command
     **/
  , value: (name, cmd) => {
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

      Object
        .keys(abbrevs)
        .forEach((abbr) => {
          if(!registry.hasOwnProperty(abbr)){
            Object.defineProperty(registry, abbr, {
              enumerable: abbr == _name ? true : false
            , configurable: true
            , get: () => {
                return _command;
              }
            , set: (val) => {
                _command = val;
              }
            });
          }
      });
    }
  }
, unregister: {
    enumerable: false
    /**
     * Unegister a command by name
     * @function
     * @name unregister
     * @static
     * @memberof module:seeli/lib/commands
     * @param {String} name
     **/
  , value: function( name ){
      var cmd = registry[name];
      if (cmd) {
        cmd.removeAllListeners();
        cmd.reset();
        delete registry[ name ];
        cmd = null;
      }
      return this;
    }
  }

  /**
   * @memberof module:seeli/lib/commands
   * @property {Array} list A list of all registered commands
   **/
, list: {
    enumerable: false
  , get: () => {
      return Object.keys(registry);
    }
  }

  /**
   * Unregisters all commands
   * @static
   * @name reset
   * @function
   * @memberof module:seeli/lib/commands
   **/
, reset: {
    enumerable: false
  , value: function() {
      for(const key in registry ){
        this.unregister(key);
      }
      this.register('help', require( conf.get('help') ) );
      return this;
    }
  }

});

registry.register('help', require( conf.get('help') ) );
module.exports = registry;
