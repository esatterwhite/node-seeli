/*jshint laxcomma:true, smarttabs: true */
/**
 * Bass command class for creating interactive cli programs
 * @module module:lib/command
 * @author Eric Satterwhite
 * @requires prime
 * @requires options
 * @requires events
 **/
var  Prime        = require( 'prime' )              // this is prime
   , Options      = require( './options' )          // custom options
   , events       = require( 'events' )             // native events
   , os           = require( 'os' )                 // native os
   , helpers      = require( './helpers/commands' ) //
   , chalk        = require( 'chalk' )              //
   , array_append = require( 'mout/array/append' )  //
   , toArray      = require( 'mout/lang/toArray' )  //
   , nopt         = require( 'nopt' )               // native nopt
   , inquirer     = require( 'inquirer' )           // native inquirer
   , Command;                                       // The primary Class exports from the module

/**
 * Base command class for creating re-usable commands
 * @class module:lib/command.Command
 * @param {Object} [options] instance configuration
 * @param {String} [options.description=""] primary description for the command
 * @param {String|String[]} [options.usage=""] a string or array of string to describe command usage. If an array, items will be join with a new line character
 * @param {Object} [options.flags] cli flags. top level keys will be used as the long hand flag
 * @param {Function} [options.run] A function that will be used as the primary drive of the command. It should perform what ever action the command was intended to do
 * @example var x = new NAME.Command({});
 */
Command = Prime(/** @lends module:NAME.Command.prototype */{
	mixin:[Options, events.EventEmitter ]
	,options:{
		description:""
	  , usage:""
	  , args:null
	  , interactive: true
	  , flags:{
			interactive:{
				type:Boolean
				, shorthand:'i'
				, default:false
				, description:"Use the interactive propmts"
			}
			,color: {
				type:Boolean
				,description:"Enable ANSI color in output"
				,default: true
			}
		}
		, run:function( ){}
	}

	, constructor: function( options ){
		this.setOptions( options )
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
					var out = helpers.usage.from( this.options.flags )
					return array_append(
						toArray( this.options.usage ),
						[
							!!out ? "Options:" : ""
							, out
						]
					).join( os.EOL )
				}
			}

			/**
			 * The description of the command
			 * @property description
			 * @type String
			 **/
			,description:{
				get: function(){
					return this.options.description
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
						return this.parsed 
					}

					var has_args = !!this.options.args;
					
					if( has_args ){
						// append dummy arguments for nopt
						this.options.args.unshift( '', '', '' )
					}
					
					this.parsed = nopt( this.conf, this.shorthands, this.options.args || process.argv )
					
					Object.keys( this.options.flags).forEach(function( key ){
						var value = this.options.flags[ key ]
						this.parsed[ key ] = this.parsed.hasOwnProperty( key ) ? this.parsed[key] : value.default;
					}.bind( this ))

					return this.parsed
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
						return this._optcache
					}
					this._optcache = {};
					Object.keys( this.options.flags).forEach(function( key ){
						var value = this.options.flags[ key ]
						this._optcache[key]=value.type
					}.bind( this ))
					return this._optcache
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
						return this._shcache
					}
					this._shcache = {};

					Object.keys(this.options.flags).forEach(function( key ){
						var value = this.options.flags[key]
						if( value.shorthand ){
							this._shcache[value.shorthand] = [ "--" + key ]
						}
					}.bind( this ))
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
	, dispatch: function(){
		Object.keys( this.options.flags ).filter( function( flag ){
			var opt = this.options.flags[flag]

			if( !!opt.event ){
				this.emit(flag, this.argv[ flag ] )
			}
		}.bind( this ))
	}

	/**
	 * Method used to setup and execute the commands interactie mode
	 * @method module:lib/command.Command#interactive
	 * @param {Object} [arg=null] Optional argument for your command specific usage
	 * @param {Function} [callback] an optional callback to be executed when the command is complete. 
	 **/
	, interactive: function( cmd, done ){
		var questions = []
		this.interactive = true
		Object.keys(this.options.flags).forEach(function( flag ){
			var current = this.options.flags[flag];
			if( flag !== 'help'&& flag !== 'interactive'){
				if( current.skip ){
					return
				};

				var arg = {
					type: current.type === Boolean ? 'confirm' : 'input'
					,name: flag
					,message: flag + ": " + current.description
					,default: current.default || null
				}

				if( current.when ){
					arg.when = current.when;
				}

				if( current.validate){
					arg.validate = current.validate;
				}


				if( current.choices ){
					arg.type = 'list'
					arg.choices = current.choices
				}
				questions.push( arg );
			}
		}.bind( this ))

		inquirer.prompt( questions,function( answers ){
			this.options.run.call(this, null, answers, done )
		}.bind( this ))
	}

	/**
	 * resets the internal command cache to its internal state
	 * @chainable
	 * @method module:lib/command.Command#reset
	 * @return Command
	 **/
	, reset: function(){
		this._shcache = null;
		this._optcache = null;
		this.parsed = null;
		this.interactive = !!this.options.interactive
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
	, run: function( cmd, callback ){
		var done = function( err, content ){
			if( err ){
				/**
				 * @name moduleName.Command#shake
				 * @event
				 * @param {Event} e
				 * @param {Boolean} [e.withIce=false]
				 */
				this.emit('error', err )
			} else{
				/**
				 * @name moduleName.Command#shake
				 * @event
				 * @param {Event} e
				 * @param {Boolean} [e.withIce=false]
				 */
				this.emit('content', content)
			}
			callback && callback( err, content )
			process.stdout.write(os.EOL)
		}.bind( this );

		if( this.argv.interactive ) {
			if(  this.options.interactive ){
				this.dispatch()
				return this.interactive.call( this, null, done )

			} else{
				console.log('interactive mode - not availible\n'.yellow )
			}

		}
		
		this.dispatch()
		return this.options.run.call(this, cmd, this.argv, done )

	}
	, colorize: function( color, text ){
		return ( this.argv.color && chalk[color] ) ? chalk[color]( text ) : text
	}

});



module.exports = Command;