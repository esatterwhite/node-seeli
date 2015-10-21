/*jshint laxcomma:true, smarttabs: true, node: true */
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
var chalk   = require("chalk")
  , os      = require('os')
  , util    = require("util")
  , Command = require('../command')
  , conf    = require('../conf')
  , usage   = chalk.white.bold
  , noop    = function(){}
  ;

function to_help(){
	var commands = require("./");
	var color = chalk[ conf.get('color') ] || noop;
	try{
		var content = [
            usage("Usage: ") + " " + util.format("%s <%s> [options]", path.basename(process.argv[1]), color( "command" ) ),
			"",
			"Where <command> is the name the command to execute.",
			util.format("%s" , Object.keys( commands  ).map(function( name ){
				return usage("* ") + color( name ) + " - " + commands[name].description;
			}).join(os.EOL) )

		].join(os.EOL);

		return content;
	} catch( e ){
		return util.format("CLI error:".red, e.message  );
	}
}


/**
 * @singleon
 * @alias module:seeli/lib/commands/help
 */
var Help = new Command({
	description:"help..."
	,interactive:false
	,alias:['hlep']
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
			done(null, "really?" );
			return;
		}

		if( !cmd ){ 
			done(null, to_help() );
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


