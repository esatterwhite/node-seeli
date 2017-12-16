/*jshint laxcomma:true, smarttabs: true, unused: true, esnext: true, node: true */
'use strict';
/**
 * CLI harness module. Comes with free help command
 * @module seeli
 * @author Eric Satterwhite
 * @requires nopt
 * @requires util
 * @requires chaolk
 * @requires os
 * @requires seeli/lib/command
 * @requires seeli/lib/commands
 * @requires seeli/lib/conf
 * @requires seeli/lib/domain
 **/
var nopt       = require('nopt')
   , util       = require('util')
   , chalk      = require('chalk')
   , clidomain = require('./domain')
   , command    = require( './command' ) // this is command
   , commands   = require('./commands')
   , conf       = require('./conf')
   , opts
   , shorthands
   , parsed
   , clidomain
   , colors
   , help
   ;

colors = [
  'red', 'blue','green'
, 'yellow','bold', 'grey'
, 'dim', 'black', 'magenta'
, 'cyan', 'redBright', 'blueBright'
, 'greenBright', 'yellowBright', 'cyanBright'
];

clidomain.on('error', function(err){
  console.error( chalk.red( util.format( '%s:', err.name) ), chalk( err.message ) );
  if( parsed && parsed.traceback ){
  console.error( chalk.bold( chalk.red( err.stack ) ) );
  } else {
    console.error('use --traceback for full stacktrace');
  }
  return conf.get('exitOnError') ? process.exit( err.code || 1 ) : null;
});

// primary flags
opts = {
  help: Boolean
, traceback: Boolean
};

// flag alias
shorthands = {
  'h':['--help']
};

module.exports = {
/**
 * Registers a command by name
 * @static
 * @method module:seel#use
 * @param {String} name Registered name of the command
 * @param {module:seel/lib/command} Command the Command to execute by name
 **/
  use: commands.register.bind( commands )
/**
 * @readonly
 * @name Command
 * @memberof seeli
 * @property {module:seel/lib/command} Command Short cut to the primary commadn class
 **/
, Command: command
/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
, get: conf.get
/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
, set: conf.set
/**
 * Overrides a named command unconditionally
 * @param {String} name The name of the command to set
 * @param {module:seel/lib/command} command A commadn to over ride
 **/
, cmd: cmd
/**
 * starts the command line execution process
 **/
, run: run
, commands: commands
, reset: commands.reset.bind( commands )
};

colors.forEach(( color ) => {
  module.exports[color] = chalk[color].bind( chalk );
});

Object.defineProperties( module.exports, {
  /**
   * @readonly
   * @name list
   * @memberof seeli
   * @property {Array} list returns a list of registered commands
   **/
  list:{
    get: function(){
      return Object.keys( commands );
    }
  }
});


function cmd( key, value ){
  commands[ key ] = value;
}

function run( ){
  parsed = nopt( opts, shorthands );
  const cb = (err, content ) => {
    if (err) return;
    console.log( content || '' );
    if( conf.get('exitOnContent') ){
      process.exit(0);
    }
  };

  // pull out the first non-flag argument
  command = parsed.argv.remain.shift();
  // did the try to use the help command directly?
  help = !!parsed.help;
  if( help || command === 'help' || command == null ){
    command = ( command === 'help' || command == null ) ? parsed.argv.remain.shift() : command;
    // allow for abbreviated commands
    return clidomain.run(function(){
      commands.help.run( command, cb);
    });
  }

  if(commands.hasOwnProperty( command ) ) {
    return clidomain.run(function(){
      commands[command].run(null, cb);
    });
  }
  console.error('unknown command %s', command );
  console.error('know commands: %s ', Object.keys( commands ).join(', ') );
  process.exit(0);
}
