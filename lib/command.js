/*jshint laxcomma:true, smarttabs: true */
/* globals: require */
'use strict';
/**
 * Bass command class for creating interactive cli programs
 * @module module:lib/command
 * @author Eric Satterwhite
 * @requires prime
 * @requires options
 * @requires events
 **/
var  Prime        = require( 'prime' )              // this is prime
   , os           = require( 'os' )                 // native os
   , util         = require( 'util' )
   , inquirer     = require( 'inquirer' )           // native inquirer
   , nopt         = require( 'nopt' )               // native nopt
   , chalk        = require( 'chalk' )              //
   , events       = require( 'events' )             // native events
   , array_append = require( 'mout/array/append' )  //
   , toArray      = require( 'mout/lang/toArray' )  //
   , Options      = require( './options' )          // custom options
   , helpers      = require( './helpers/commands' ) //
   , exceptions   = require( './exceptions')
   , stop_flags   = ['help', 'interactive', 'skip','color']
   , Command;                                       // The primary Class exports from the module

/**
 * Base command class for creating re-usable commands
 * @class module:lib/command.Command
 * @param {Object} [options] instance configuration
 * @param {String} [options.description=""] primary description for the command
 * @param {String|String[]} [options.usage=""] a string or array of string to describe command usage. If an array, items will be join with a new line character
 * @param {Object} [options.flags] cli flags. top level keys will be used as the long hand flag
 * @param {Function} [options.run] A function that will be used as the primary drive of the command. It should perform what ever action the command was intended to do
  * @example var hello = new Command({
  	options:{
 		description:"diaplays a simple hello world command"
 		,usage:[
 			"Usage: cli hello --interactive",
 			"Usage: cli hello --name=john",
 			"Usage: cli hello --name=john --name=marry --name=paul -v screaming"
 		]
 		,flags:{
 			name:{
 				type:[ String, Array ]
 				,shorthand:'n'
 				,description:"The name of the person to say hello to"
 			}
 			,excited: {
 				type:Boolean
 				,shorthand: 'e'
 				,description:"Say hello in a very excited manner"
 				,default:false
 			}
 			,volume:{
 				type:String
 				,choices:['normal', 'screaming']
 				,default:'normal'
 				,shorthand:'v'
 			}
 		}
 		,run: function( cmd, data, cb ){
 			var out = [];

 			for( var x =0; x< data.name.length; x++ ){
 				out.push( "Hello, " + data.name[x] + "!" );
 			}
 			out = out.join('\n');

 			out = data.value == 'screaming' ? out.toUpperCase() : out;
 			callback( out );
 	
 		}
  	}
 });
 */
Command = Prime(/** @lends module:NAME.Command.prototype */{
	mixin:[Options, events.EventEmitter ]
	,options:{
		description:''
	  , usage:''
	  , args:null
	  , interactive: true
	  , flags:{
			interactive:{
				type:Boolean
				, shorthand:'i'
				, default:false
				, description:'Use the interactive propmts'
			}
			,color: {
				type:Boolean
				,description:'Enable ANSI color in output'
				,default: true
				,skip:true
			}
		}
		, run:function( ){}
	}

	, constructor: function( options ){
		this.setOptions( options );
		events.EventEmitter.call( this );
		Object.defineProperties(this,{

			/**
			 * constructs and retuns the final command usage 
			 * @property usage
			 * @type string
			 **/
			usage:{
				configurable:true,
				get:function(){
					var out = helpers.usage.from( this.options.flags );
					return array_append(
						toArray( this.options.usage ),
						[
							!!out ? 'Options:' : ''
							, out
						]
					).join( os.EOL );
				}
			}

			/**
			 * The description of the command
			 * @property description
			 * @type String
			 **/
			,description:{
				get: function(){
					return this.options.description;
				}
			}

			/**
			 * the finale parsed out command line input as key/value pairs
			 * @property module:lib/command.Command.argv
			 * @type object
			 **/
			,argv:{
				get: function( ){
					if( this.parsed ){
						return this.parsed ;
					}

					var has_args = !!this.options.args
					if( has_args ){
						// append dummy arguments for nopt
						this.options.args.unshift( '', '', '' );
					}
					
					this.parsed = nopt( this.conf, this.shorthands, this.options.args || process.argv );
					
					Object.keys( this.options.flags).forEach(function( key ){
						var value = this.options.flags[ key ];
						this.parsed[ key ] = this.parsed.hasOwnProperty( key ) ? this.parsed[key] : value.default;

					}.bind( this ));

					return this.parsed;
				}
			}

			/**
			 * Constructs and return an object of flags and their types for 
			 * consumption by the command
			 * @property module:lib/command.Command.conf
			 * @type object
			 **/
			,conf:{
				get: function(){
					if( this._optcache ){
						return this._optcache;
					}
					this._optcache = {};
					this._required = [];
					Object.keys( this.options.flags).forEach(function( key ){
						var value = this.options.flags[ key ];
						this._optcache[key]=value.type;
						if( value.required ){
							this._required.push( key )
						}
					}.bind( this ));
					return this._optcache;
				}
			}

			/**
			 * Maps and returns any shorthand switchs to their parent 
			 * flags for consumptions by the command
			 * @property module:lib/command.Command.shorthands
			 * @type object
			 **/
			,shorthands:{
				get: function( ){
					if( this._shcache ){
						return this._shcache;
					}
					this._shcache = {};

					Object.keys(this.options.flags).forEach(function( key ){
						var value = this.options.flags[key];
						if( value.shorthand ){
							this._shcache[value.shorthand] = [ '--' + key ];
						}
					}.bind( this ));
					return this._shcache;
				}
			}
		});
	}

	/**
	 * Dispatchs an event for each flag that has the event flag enabled
	 * protected
	 * @method module:lib/command.Command#dispatch
	 **/
	, dispatch: function dispatch(){
		Object.keys( this.options.flags ).filter( function( flag ){
			var opt = this.options.flags[flag];

			if( !!opt.event ){
				this.emit(flag, this.argv[ flag ] );
			}
		}.bind( this ));
	}

	/**
	 * Method used to setup and execute the commands interactie mode
	 * @method module:lib/command.Command#interactive
	 * @param {Object} [arg=null] Optional argument for your command specific usage
	 * @param {Function} [callback] an optional callback to be executed when the command is complete. 
	 **/
	, interactive: function interactive( cmd, done ){
		var questions = [];

		this.interactive = true;
		Object
			.keys(this.options.flags)
			.filter( function( flag ){
				return stop_flags.indexOf( flag ) == -1;
			})
			.forEach(function( flag ){
				var current = this.options.flags[flag]
				  , arg
				  ;

				arg = {
					type: current.type === Boolean ? 'confirm' : 'input'
					,name: flag
					,message: flag + ' : ' + current.description
					,default: current.default || null
				};

				arg.when     = current.when     ? current.when.bind( null, cmd ) : undefined;
				arg.validate = current.validate ? current.when.bind( null, cmd ) : undefined;
				arg.filter   = current.filter   ? current.when.bind( null, cmd ) : undefined;

				if( current.choices ){
					arg.type = 'list';
					arg.choices = current.choices;
				}

				questions.push( arg );
			}.bind( this ));

			inquirer
				.prompt( questions )
				.then(function( answers ){
					this.options.run.call(this, cmd, answers, done );
				}.bind( this ));
	}

	/**
	 * resets the internal command cache to its internal state
	 * @chainable
	 * @method module:lib/command.Command#reset
	 * @return Command
	 **/
	, reset: function reset(){
		this._shcache     = null;
		this._optcache    = null;
		this.parsed       = null;
		this.interactive  = !!this.options.interactive;
		this.options.args = null
		return this;
	}

	/**
	 * Executes the command as defined
	 * @protected
	 * @method module:lib/command.Command#run
	 * @param {Object} [arg=null] Optional argument for your command specific usage
	 * @param {Function} [callback] an optional callback to be executed when the command is complete. 
	 * Will be passed the contents return by the command 
	 * @return String|undefined Will return the result from the command specific run directive if there is any.
	 **/
	, run: function run( cmd, callback ){
		var done      // callback function for commadn
		  , command   // the command that is being executed
		  , directive // the first non-flag directive passed to the command
		  ;
		  
		done = function( err, content ){
			content = !!this.argv.color ? content : chalk.stripColor( content );
			if( err ){
				/**
				 * dispatched when the command has failed in some way
				 * @name command.Command#error
				 * @event
				 * @param {Error} e
				 */
				this.emit('error', err );
			} else{
				/**
				 * dispatched when the command has sucessfully completed
				 * @name command.Command#content
				 * @event
				 * @param {Error} e
				 */
				this.emit('content', content);
			}
			callback && callback( err, content );
		}.bind( this );

		command = this.argv.argv.remain[0]
		directive = this.argv.argv.remain[1]
		cmd = cmd ? cmd : directive || null

		if( this.argv.interactive ) {
			if(  this.options.interactive ){
				this.dispatch();
				return this.interactive.call( this, cmd, done );

			} else{
				console.log('interactive mode - not availible\n'.yellow );
			}

		}
		this.validate( cmd );
		this.dispatch();
		var result = this.options.run.call(this, cmd, this.argv, done );
		return !!this.argv.color ? result : chalk.stripColor( result );

	}
	, validate: function validate( cmd ){
		var UNDEF;
		
		Object
			.keys(this.options.flags)
			.filter( function( flag ){
				return stop_flags.indexOf( flag ) == -1;
			})
			.forEach(function( flag ){
				var cfg = this.options.flags[flag]
				  , validator = cfg.validate
				  , isValid
				  ;
				
				if( this._required.indexOf( flag) >=0 && this.parsed[flag] === UNDEF ){
					this.emit('error', new exceptions.RequiredFieldError( flag ) );
				}

				isValid = validator ? validator.call(null, cmd, this.parsed ) : true

				if(isValid === false ){
					return this.emit('error', new exceptions.InvalidFieldException( util.format("%s failed validation.", flag) ) );
				}

				if( typeof isValid == 'string'){
					return this.emit('error', new exceptions.InvalidFieldException( util.format("%s - %s", flag, isValid ) ) );
				}
			}.bind(this));
	}

	, colorize: function colorize( color, text ){
		return ( this.argv.color && chalk[color] ) ? chalk[color]( text ) : text;
	}

});

module.exports = Command;
