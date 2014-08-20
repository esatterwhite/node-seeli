/*jshint laxcomma:true, smarttabs: true */
/**
 * CLI harness module. Comes with free help command
 * @module seeli
 * @author Eric Satterwhite
 * @requires prime
 * @requires mout
 * @requires nopt
 * @requires domain
 * @requires os
 * @requires fs
 * @requires pathh
 * @requires abbrev
 * @requires util
 * @requires chalk
 * @requires module:lib/command
 * @requires module:lib/commands
 **/
var  command    = require( './command' ) // this is command
   , prime      = require( 'prime' ) // custom prime
   , isFunction = require("mout/lang/isFunction")
   , nopt       = require('nopt')
   , domain     = require("domain")
   , os         = require("os")
   , fs         = require("fs")
   , path       = require("path")
   , abbrev     = require("abbrev")
   , util       = require("util")
   , chalk      = require("chalk")
   , commands   = require("./commands")
   , command_list
   , shorthands
   , parsed
   , clidomain
   , colors
   , help;                         // The primary Class exports from the module

colors = ['red', 'blue','green', 'yellow','bold', 'grey', 'dim', 'black', 'magenta']
clidomain = domain.create()
clidomain.on('error', function(err, domn ){
  console.log( chalk.red( util.format( "%s:", err.name) ), chalk.bold( err.message ) )
  if( parsed && parsed.traceback ){
	console.log( chalk.red( err.stack ) )
  } else {
  	console.log('use --traceback for full stacktrace')
  }

  return err.code ? process.exit( err.code ) : null;
})

exports.use = commands.register.bind( commands );
exports.remove = commands.unregister.bind( commands );

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

Object.defineProperties( exports,{
	list:{
		get: function(){
			return Object.keys( commands )
		}
	}
});

exports.commands = commands
exports.reset = commands.reset.bind( commands );

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
			commands.help.run( command ) 
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
