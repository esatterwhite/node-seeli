/*jshint laxcomma: true, smarttabs: true, node: true*/
'use strict';
/**
 * Command registry for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires util
 * @requires os
 * @requires abbrev
 * @requires seeli/lib/commands/help
 * @requires mout/array/comine
 */
var abbrev   = require("abbrev")
  , os       = require("os")
  , conf     = require('../conf')
  , combine  = require('mout/array/combine')
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
			var abbrevs = abbrev( name );

			if( cmd.alias ){
				if( Array.isArray( cmd.alias ) ){
					combine( abbrevs, cmd.alias );
				} else{
					abbrevs.push( cmd.alias.toString() );
				}
			} 
			// each command will emit a content event
			// when it has processed it's final
			cmd.on('content', function( content ){
				process.stdout.write( content || '' );
				process.stdout.write( os.EOL );
				
				if( options.exit ){
					process.exit(0);
				}

			}.bind( this ) );

			// generate short hand commands
			// that are accessable but not enumerable.
			// really just for typo support.
			Object.keys( abbrevs ).forEach( function( c ){

				if( !registry.hasOwnProperty( c ) ){
					Object.defineProperty( registry, c, {
						enumerable:c == name ? true : false
						,configurable:true
						,get: function(){
							return cmd;
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
				registry[ name ] = null;
				cmd = null;
			}

			return this;
		}
	}

	/**
	 * @property {Boolean} exitOnContent If trun seeli will force the process to exit when the specified command has completed
	 **/
	,exitOnContent: {
		enumerable: false
		,get: function(){
			return !!options.exit;
		}

		,set: function( exit ){
			options.exit = !!exit;
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
			return this;
		}
	}

});

registry.register('help', require( conf.get('help') ) );
module.exports = registry;
