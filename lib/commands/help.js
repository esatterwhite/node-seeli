/*jshint laxcomma:true, smarttabs: true, node: true, unused: true */
"use strict";
/**
 * Built in command for constructing help for seeli and all registered commands
 * @module module:seeli/lib/commands/help
 * @author Eric Satterwhite
 * @requires chalk
 * @requires os
 * @requires utils
 * @requires path
 * @requires module:lib/command
 * @requires module:lib/command
 **/
var os      = require('os')
  , Command = require('../command')
  , list = require('../helpers/commands').list
  ;

/**
 * @singleon
 * @alias module:seeli/lib/commands/help
 */
var Help = new Command({
	description:"help..."
	,interactive:false
	,alias:['hlep']
	,run: function( cmd, data, done ){
		var commands
		  , cls
		  , instance
		  , help
		  , breaker
		  , len
		  ;


		if( cmd == "help" ){
			done(null, "really?" );
			return;
		}

		if( !cmd ){ 
			done(null, list() );
			return;
		}

		commands = require( './index' );
		cls      = commands[ cmd ];
		instance = typeof cls === 'function' ? new cls() : cls;
		
		try{
			help = [instance.description];
			breaker = '', len = instance.description.length;

			while( len-- ){
					breaker += '=';
			}
			help.push( breaker, instance.usage );

			help = help.join( os.EOL );
		} catch( e ){
			help = "no help found for " + cmd + " "+ e.message;
		}
		done( null, help );

		return;
	}
});

module.exports = Help;


