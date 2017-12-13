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
var abbrev   = require("abbrev")
  , os       = require("os")
  , conf     = require('../conf')
  , debug    = require('debug')('seeli:commands')
  , toArray  = require('mout/lang/toArray')
  , fill     = require('mout/object/fillIn')
  , registry = {}
  , options  = {}
  ;

Object.defineProperties(registry,{

  register:{
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
    ,value: function( name, cmd ){
      var abbrevs = abbrev( name )
        , alias = cmd.options.alias
        , _cmd = cmd;
      if( alias ){
        debug('registering %s with aliases', name, cmd.options.alias);
        toArray( alias )
          .forEach( function( a ){
            fill( abbrevs, abbrev(a) );
          });
      }

      // generate short hand commands
      // that are accessable but not enumerable.
      // really just for typo support.
      Object.keys( abbrevs ).forEach( function( c ){

        if( !registry.hasOwnProperty( c ) ){
          Object.defineProperty( registry, c, {
            enumerable:c == name ? true : false
            ,configurable:true
            ,get: function(){
              return _cmd;
            }
            ,set: function( val ){
              _cmd = val;
            }

          });
        }
      });
    }
  }
  ,unregister: {
    enumerable: false
    /**
     * Unegister a command by name
     * @function
     * @name unregister
     * @static
     * @memberof module:seeli/lib/commands
     * @param {String} name
     **/
    ,value: function( name ){
      var cmd = registry[ name ];
      if( cmd ){
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
  ,list: {
    enumerable:false
    ,get:function(){
      return Object.keys( registry );
    }
  }

  /**
   * Unregisters all commands
   * @static
   * @name reset
   * @function
   * @memberof module:seeli/lib/commands
   **/
  ,reset: {
    enumerable: false
    ,value: function(){
      for(var key in registry ){
        this.unregister( key );
      }
      this.register('help', require( conf.get('help') ) );
      return this;
    }
  }

});

registry.register('help', require( conf.get('help') ) );
module.exports = registry;
