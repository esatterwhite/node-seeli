/*jshint laxcomma:true, smarttabs: true */
"use strict";
/**
 * DESCRIPTION
 * @module NAME
 * @author 
 * @requires moduleA
 * @requires moduleB
 * @requires moduleC
 **/
var chalk = require("chalk")
var os = require('os')
var util = require("util")
var path = require("path")
var Command = require('../command')
var chalk = require('chalk')

var usage = chalk.white.bold
var command = chalk.blue
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
		if( cmd == "help" ){
			done(null, "really?" )
			return;
		}

		if( !cmd ){ 
			console.log('running to help')
			done(null, to_help() )
			return;
		}


		var commands = require( './index' )
		var cls = commands[cmd];
		var instance =  typeof cls === 'function' ? new cls() : cls;
		
		try{
			var help  = instance.description + os.EOL + instance.usage
		} catch( e ){
			var help = "no help found for " + cmd + " "+ e.message
		}
		done( null, help )
		return;
	}
});

module.exports = Help;


