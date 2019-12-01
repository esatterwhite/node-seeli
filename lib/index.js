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
 **/
var nopt       = require('nopt')
  , util       = require('util')
  , chalk      = require('chalk')
  , command    = require('./command')
  , commands   = require('./commands')
  , conf       = require('./conf')
  , opts
  , shorthands
  , parsed
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

process.on('unhandledRejection', onError);

function onError (err) {
  console.error(`${chalk.red(err.name)}: ${err.message}`);
  if(parsed && parsed.traceback) {
  console.error(chalk.bold(chalk.red(err.stack)));
  } else {
    console.error('use --traceback for full stacktrace');
  }
  return conf.get('exitOnError') ? process.exit( err.code || 1 ) : null;
}

function onComplete(content) {
  typeof content === 'string' && console.log( content );
  if(conf.get('exitOnContent')) {
    process.exit(0);
  }
}

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
 * starts the command line execution process
 **/
, run: run
, commands: commands
, reset: commands.reset.bind( commands )
/**
 * colorizes a given string using the chalk color found in local configuration
 * @param {String} text A string to wrap in an ansi color
 * @returns {String} The given string wrapped in the configued ansi color
 * @example
 * const seeli = require('seeli')
 * seeli.set('color', 'blue')
 * seeli.colorize('I am blue')
 **/
, colorize: (txt) => {
    const color = chalk[conf.get('color')]
    if (!color) return txt
    return color(txt)
  }
};

colors.forEach(( color ) => {
  module.exports[color] = chalk[color]
});

Object.defineProperties( module.exports, {
  /**
   * @readonly
   * @name list
   * @memberof seeli
   * @property {Array} list returns a list of registered commands
   **/
  list: {
    get: function(){
      return Object.keys( commands );
    }
  }
});
function run( ){
  parsed = nopt( opts, shorthands );

  // pull out the first non-flag argument
  command = parsed.argv.remain.shift();
  // did the try to use the help command directly?
  help = !!parsed.help;
  if( help || command === 'help' || command == null ){
    // allow for abbreviated commands
    command = ( command === 'help' || command == null ) ? parsed.argv.remain.shift() : command;
    return commands.help.run(command).then(onComplete).catch(onError);
  }

  if(commands.hasOwnProperty( command ) ) {
    return commands[command].run(null).then(onComplete).catch(onError);
  }

  console.error('unknown command %s', command );
  console.error('know commands: %s ', Object.keys( commands ).join(', ') );
  process.exit(0);
}
