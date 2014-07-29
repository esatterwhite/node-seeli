/*jshint laxcomma:true, smarttabs: true */
/**
 * DESCRIPTION
 * @module NAME
 * @author 
 * @requires command
 * @requires prime
 **/
var  command = require( './command' ) // this is command
   , prime = require( 'prime' ) // custom prime
   , isFunction = require("mout/lang/isFunction")
   , nopt = require('nopt')
   , domain = require("domain")
   , os = require("os")
   , fs = require("fs")
   , path = require("path")
   , abbrev = require("abbrev")
   , util = require("util")
   , chalk = require("chalk")
   , commands = require("./commands")
   , command_list
   , shorthands
   , parsed
   , clidomain
   , colors
   , help
   , commands;                         // The primary Class exports from the module

colors = ['red', 'blue','green', 'yellow','bold', 'grey', 'dim', 'black', 'magenta']
clidomain = domain.create()
clidomain.on('error', function(err, domn ){
  console.log( chalk.bold( util.format( "something bad happened - %s : %s", err.name, err.message) ) )
  if( parsed && parsed.traceback ){
	console.log( chalk.red( err.stack ) )
  }

  process.exit( 0 )
})

exports.use = commands.register;

Object.keys( commands ).forEach( function( key ){
	exports.use( key, commands[key])
})

// primary flags
opts = {
	"help":Boolean
	,version:Boolean
	,traceback: Boolean
};

// flag alias
shorthands = {
	'h':['--help']
	,'v':['--version']
};




exports.Command = command;
exports.Class = prime;
exports.list = commands.list
exports.commands = commands
colors.forEach( function( color ){
	exports[color] = chalk[color].bind( chalk )
})
exports.run = function( ){
	parsed = nopt( opts, shorthands );

	// pull out the first non-flag argument
	command = parsed.argv.remain.shift();
	// did the try to use the help command directly?
	help = !!parsed.help
	if( help || command == 'help' || command == null ){
		command = ( command == "help" || command == null ) ? parsed.argv.remain.shift() : command
		// allow for abbreviated commands
		return clidomain.run(function(){
			console.log( commands.help.run( command ) )
		});
	}


	if(commands.hasOwnProperty( command ) ) {
		return clidomain.run(function(){
		  commands[command].run(null)
		})
	}
	console.error('unknown command %s', command )
	console.log("know commands: %s ", Object.keys( commands ).join(', ') )
	process.exit(0);
}
