/*jshint laxcomma:true, smarttabs: true, node: true, esnext: true, unused: true */

'use strict';
/**
 * Bass command class for creating interactive cli programs
 * @module module:lib/command
 * @author Eric Satterwhite
 * @requires options
 * @requires events
 * @requires os
 * @requires url
 * @requires inquirer
 * @requires nopt
 * @requires chalk
 * @requires clone
 * @requires mout/array/append
 * @requires mout/object/hasOwn
 * @requires mout/lang/isObject
 * @requires seeli/lib/domain
 * @requires seeli/lib/helpers/commands
 * @requires seeli/lib/exceptions
 **/
const  os           = require( 'os' )                 // native os
     , url          = require( 'url' )
     , path         = require( 'path' )
     , inquirer     = require( 'inquirer' )           // native inquirer
     , nopt         = require( 'nopt' )               // native nopt
     , chalk        = require( 'chalk' )              //
     , events       = require( 'events' )             // native events
     , array_append = require( 'mout/array/append' )  //
     , toArray      = require( 'mout/lang/toArray' )  //
     , domain       = require( './domain')
     , helpers      = require( './helpers/commands' ) //
     , exceptions   = require( './exceptions')
     , hasOwn       = require( 'mout/object/hasOwn' )
     , clone        = require( 'clone' )
     , isObject     = require( 'mout/lang/isObject' )
     , stop_flags   = ['help', 'interactive', 'skip','color']
     , on_exp       = /^on[A-z]/
     , noop         = () => {}
     ;

/**
 * Deep merge objects. except for path & url
 * this breaks nopt as it is comparing to those module objects
 */
function merge() {
  let i = 1
    , key
    , val
    , obj
    , target
    ;

  // make sure we don't modify source element and it's properties
  // objects are passed by reference
  target = clone( arguments[0] );
  while (obj = arguments[i++]) {
    for (key in obj) {
      if ( !hasOwn(obj, key) ) {
          continue;
      }

      val = obj[key];
      if ( isObject(val) && isObject(target[key]) ){
        // inception, deep merge objects
        target[key] = merge(target[key], val);
      } else {
        let is_url = val && val.type == url;
        let is_path = val && val.type == path;

        // make sure arrays, regexp, date, objects are cloned
        target[key] = clone(val);
        if( is_url ){
          target[key].type = url;
        }

        if( is_path ){
          target[key].type = path;
        }
      }
    }
  }
  return target;
}


function removeOn( name ){
  return name.replace(on_exp, function(full, first ){
    return first.toLowerCase();
  });
}

const defaults = {
  description: ''
, usage: ''
, args: null
, interactive: true
, flags: {
  interactive: {
    type:Boolean
  , shorthand: 'i'
  , default: false
  , description: 'Use the interactive propmts'
  }
, color: {
    type: Boolean
  , description: 'Enable ANSI color in output'
  , default: true
  , skip: true
  }
}
, run: noop
};


/**
 * Base command class for creating re-usable commands
 * @constructor
 * @alias module:seeli/lib/command
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
class Command extends events.EventEmitter {

  constructor ( ...options ){
    super( );
    events.EventEmitter.call( this );
    domain.add( this );
    this.options = Object.create(null);
    this.reset();
    this.setOptions( defaults, ...options );
  }

  /**
   * constructs and retuns the final command usage
   * @property usage
   * @type string
   **/
  get usage(){
    var out = helpers.usage.from( this.options.flags );
    return array_append(
      toArray( this.options.usage ),
      [
        ''
        , !!out ? 'Options:' : ''
        , out
      ]
    ).join( os.EOL );
  }

  /**
   * The description of the command
   * @property description
   * @type String
   **/
  get description(){
    return this.options.description;
  }

  /**
   * the finale parsed out command line input as key/value pairs
   * @property module:lib/command.Command.argv
   * @type object
   **/
  get argv( ){
    let that = this;
    let has_args = !!this.options.args;

    if( this.parsed ){
      return this.parsed ;
    }

    if( has_args ){
      // append dummy arguments for nopt
      this.options.args.unshift( '', '', '' );
    }
    this.parsed = nopt( this.conf, this.shorthands, this.options.args || process.argv );
    Object.keys( this.options.flags).forEach(function( key ){
      var value = that.options.flags[ key ];
      that.parsed[ key ] = that.parsed.hasOwnProperty( key ) ? that.parsed[key] : value.default;
    });

    return this.parsed;
  }

  /**
   * Constructs and return an object of flags and their types for
   * consumption by the command
   * @property module:lib/command.Command.conf
   * @type object
   **/
  get conf(){
    let that = this;

    if( this._optcache ){
      return this._optcache;
    }
    this._optcache = {};
    this._required = [];
    Object.keys( this.options.flags ).forEach(function( key ){
      let value = that.options.flags[ key ];
      that._optcache[key]=value.type;
      if( value.required ){
        that._required.push( key );
      }
    });
    return this._optcache;
  }

  /**
   * Maps and returns any shorthand switchs to their parent
   * flags for consumptions by the command
   * @property module:lib/command.Command.shorthands
   * @type object
   **/
  get shorthands( ){
    if( this._shcache ){
      return this._shcache;
    }
    this._shcache = Object.create(null);

    Object.keys(this.options.flags).forEach(function( key ){
      var value = this.options.flags[key];
      if( value.shorthand ){
        this._shcache[value.shorthand] = [ '--' + key ];
      }
    }.bind( this ));
    return this._shcache;
  }


  /**
   * merges passing in object as configuration overrides
   * @param {Object} [options] Configuration overrides to set
   */
  setOptions( ...opts ){
    this.options = merge.apply(null, [{}, super.options || {}, this.options || {}, ...opts] );
    let options  = this.options;
    if( this.addListener ){
      for( var opt in options ){
        if( typeof( options[ opt ] ) == 'function' || on_exp.test(opt) ) {
          this.addListener( removeOn( opt ), options[ opt ]);
        }
      }
    }
    return this;
  }
  /**
   * Dispatchs an event for each flag that has the event flag enabled
   * protected
   * @method module:lib/command.Command#dispatch
   **/
  dispatch(){
    let keys = Object.keys( this.options.flags );

    for( let flag of keys ){
      let opt = this.options.flags[flag];

      if( !!opt.event ){
        this.emit(flag, this.argv[ flag ] );
      }
    }

    return this;
  }

  /**
   * Method used to setup and execute the commands interactie mode
   * @method module:seeli/lib/command.Command#interactive
   * @param {Object} [arg=null] Optional argument for your command specific usage
   * @param {Function} [callback] an optional callback to be executed when the command is complete.
   **/
  interactive( cmd, done ){
    let that = this, flags;
    flags = Object
      .keys(this.options.flags)
      .filter( function( flag ){
        return stop_flags.indexOf( flag ) == -1;
      });

    const answers = Object.create(null);
    const series = (cb) => {
      const next = () => {
        if (!flags.length) return cb(null, answers);
        const flag = flags.shift();
        const current = that.options.flags[flag];
        if (Array.isArray(current.type)) {
          return ask(flag, cmd, current, (err, results) => {
            if(err) return done(err);
            answers[flag] = results;
            next();
          });
        }
        const arg = toQuestion(flag, cmd, current);
        inquirer
          .prompt(arg)
          .then((answer) => {
            Object.assign(answers, answer);
            next();
          })
          .catch(done);
      };
      next();
    };

    series((err) => {
      if (err) return done(err);
      let args = [];
      for( let answer in answers ){
        args.push( `--${answer}=${answers[answer]}` );
      }

      that.setOptions({
        args: args
      });
      that.parsed = Object.assign( that.parsed, answers );
      that.validate( cmd );
      that.dispatch( );
      return that.options.run.call(that, cmd, that.argv, done );
    });
  }

  /**
   * resets the internal command cache to its internal state
   * @chainable
   * @method module:seeli/lib/command.Command#reset
   * @return Command
   **/
  reset(){
    this._shcache     = null;
    this._optcache    = null;
    this.parsed       = null;
    this.options.args = null;
    return this;
  }

  /**
   * Executes the command as defined
   * @protected
   * @method module:seeli/lib/command.Command#run
   * @param {Object} [arg=null] Optional argument for your command specific usage
   * @param {Function} [callback] an optional callback to be executed when the command is complete.
   * Will be passed the contents return by the command
   * @return String|undefined Will return the result from the command specific run directive if there is any.
   **/
  run( cmd, callback ){
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

    command = this.argv.argv.remain[0];
    directive = this.argv.argv.remain[1];
    cmd = cmd ? cmd : directive || null;

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
  /**
   * Validates the current data set before running the command
   * @method module:seel/lib/command#validate
   * @param {String} [command] The name of the command being executed
   * @throws module:seeli/lib/exceptions/InvalidFieldException
   **/
  validate( cmd ){
    let UNDEF;
    let that = this;
    Object
      .keys(this.options.flags)
      .filter( function( flag ){
        return stop_flags.indexOf( flag ) == -1;
      })
      .forEach(function( flag ){
        var cfg = that.options.flags[flag]
          , validator = cfg.validate
          , isValid
          ;
        if( that._required.indexOf( flag) >=0 && that.parsed[flag] === UNDEF ){
          return that.emit('error', new exceptions.RequiredFieldError( flag ) );
        }

        isValid = validator ? validator.call(null, cmd, that.parsed ) : true;

        if(isValid === false ){
          return that.emit('error', new exceptions.InvalidFieldException(`${flag} failed validation.`) );
        }

        if( typeof isValid == 'string'){
          return that.emit('error', new exceptions.InvalidFieldException( `${flag} - ${isValid}` ) );
        }
      });
  }

  /**
   * Colorizes a text blob
   * @method module:seeli/lib/command#colorize
   * @param {String} color The color to use. can be one of `red`, `blue`,`green`, `yellow`,`bold`, `grey`, `dim`, `black`, `magenta`, `cyan`
   * @param {String} text text to colorize
   * @returns {String} colorized version of the text
   **/
  colorize( color, text ){
    return ( this.argv.color && chalk[color] ) ? chalk[color]( text ) : text;
  }

}

module.exports = Command;

function ask(name, cmd, opts, cb) {
  const results = [];
  const arg = toQuestion(name, cmd, opts);
  const prompt = () => {
    inquirer
      .prompt( arg )
      .then(( answer ) => {
        if ( answer[name] === '' ) return cb(null, results);
        results.push(answer[name]);
        prompt();
      })
      .catch(cb);
  };
  prompt();

}

function toQuestion(flag, cmd, opts) {
  const arg = {
    type: opts.type === Boolean ? 'confirm' : opts.mask ? 'password' : 'input'
    ,name: flag
    ,message: flag + ' : ' + opts.description
    ,default: opts.default || null
  };

  arg.when     = opts.when     ? opts.when.bind( null, cmd ) : undefined;
  arg.validate = opts.validate ? opts.when.bind( null, cmd ) : undefined;
  arg.filter   = opts.filter   ? opts.when.bind( null, cmd ) : undefined;

  if( opts.choices ){
    arg.type = 'list';
    arg.choices = opts.choices;
  }
  return arg;
}
