/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * DESCRIPTION
 * @module module:lib/commands/help
 * @author Eric Satterwhite
 * @requires chalk
 * @requires os
 * @requires utils
 * @requires path
 * @requires module:lib/command
 * @requires module:lib/command
 **/
var chalk   = require("chalk")
  , os      = require('os')
  , util    = require("util")
  , path    = require("path")
  , Command = require('../command')
  , usage   = chalk.white.bold
  , command = chalk.green

function to_help(){
	var commands = require("./")
	try{
		var content = [
			usage("Usage: ") + " " + util.format("seeli <%s> [options]", command( "command" ) ),
			"",
			"where <command> is the name the command to execute.",
			util.format("%s" , Object.keys( commands  ).map(function( name ){
				return usage("* ") + command( name ) + " - " + commands[name].description
			}).join(os.EOL) )

		].join(os.EOL)

		return content;
	} catch( e ){
		return util.format("CLI error:".red, e.message  );
	}
}


/**
 * DESCRIPTION
 * @class module:NAME.Thing
 * @param {TYPE} NAME DESCRIPTION
 * @example var x = new NAME.Thing({});
 */
var Help = new Command(/** @lends module:NAME.Thing.prototype */{
	description:"help..."
	,interactive:false
	/**
	 * DESCRIPTION
	 * @method NAME
	 * @param {TYPE} NAME ...
	 * @param {TYPE} NAME ...
	 * @return
	 **/
	, run: function( cmd, data, done ){
		var commands
		  , cls
		  , instance
		  , help
		  , breaker
		  , len
		  ;


		if( cmd == "help" ){
			done(null, "really?" )
			return;
		}

		if( !cmd ){ 
			done(null, to_help() )
			return;
		}

		commands = require( './index' )
		cls      = commands[ cmd ];
		instance = typeof cls === 'function' ? new cls() : cls;
		
		try{
			help = [instance.description];
			breaker = '', len = instance.description.length;

			while( len-- ){
					breaker += '='
			}
			help.push( breaker, instance.usage )

			help = help.join( os.EOL )
		} catch( e ){
			var help = "no help found for " + cmd + " "+ e.message
		}
		done( null, help )

		return;
	}
});

module.exports = Help;


