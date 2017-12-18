/*jshint laxcomma:true, smarttabs: true, node: true, esnext: true, unused: true */

'use strict';
/**
 * Base command class for creating interactive cli programs
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
 * @requires debug
 * @requires strip-ansi
 * @requires mout/array/append
 * @requires mout/lang/toArray
 * @requires mout/object/hasOwn
 * @requires mout/lang/isObject
 * @requires seeli/lib/usage
 * @requires seeli/lib/exceptions
 * @requires seeli/lib/conf
 * @requires seeli/lib/lang/object
 **/
const  os           = require( 'os' )                 // native os
     , tty          = require( 'tty' )
     , url          = require( 'url' )
     , path         = require( 'path' )
     , events       = require( 'events' )             // native events
     , clone        = require( 'clone' )
     , inquirer     = require( 'inquirer' )           // native inquirer
     , nopt         = require( 'nopt' )               // native nopt
     , chalk        = require( 'chalk' )              // ansi color support
     , strip        = require( 'strip-ansi')          // function helper to remove ansi color
     , array_append = require( 'mout/array/append' )  //
     , toArray      = require( 'mout/lang/toArray' )  //
     , hasOwn       = require( 'mout/object/hasOwn' )
     , isObject     = require( 'mout/lang/isObject' )
     , debug        = require( 'debug')
     , conf         = require( './conf' )
     , usage        = require( './usage')
     , object       = require( './lang/object' )
     , typeOf       = require( './usage/type-of' )
     , exceptions   = require( './exceptions' )
     , stop_flags   = ['help', 'interactive', 'skip','color']
     , ARGV         = 'argv'
     , on_exp       = /^on[A-z]/
     , noop         = async () => { return null }
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
, strict: false
, args: null
, interactive: true
, name: 'command'
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
    this._shcache     = null;
    this._optcache    = null;
    this.parsed       = null;
    this.options = Object.create(null);
    this.reset();
    this.setOptions( defaults, ...options );

    this.debug = debug(`${conf.get('name')}:${this.options.name}`)
    this.debug('strict mode: %s', this.options.strict);
  }

  /**
   * constructs and retuns the final command usage
   * @property usage
   * @type string
   **/
  get usage(){
    var out = usage.from( this.options.flags );
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
   * the final parsed out command line input as key/value pairs
   * @property module:lib/command.Command.argv
   * @type object
   * @throws module:seeli/lib/exceptions/UnknownFlagException
   **/
  get argv( ){
    const has_args = !!this.options.args;

    if( this.parsed ){
      return this.parsed;
    }

    if( has_args ){
      // append dummy arguments for nopt
      this.options.args.unshift( '', '', '' );
    }

    this.parsed = nopt( this.conf, this.shorthands, this.options.args || process.argv );
    const keys = new Set(Object.keys(this.options.flags).concat(Object.keys(this.parsed)));

    for (const key of keys) {
      if (key === ARGV) continue;
      const flag = this.options.flags[ key ];

      if (!flag) {
        if (this.options.strict) {
          const error = new exceptions.UnknownFlagException(key);
          tty.isatty() && console.log(this.usage);
          this.emit('error', error);

          return this.parsed;
        }
        continue;
      }
      const value = hasOwn(this.parsed, key) ? this.parsed[key] : flag.default;
      object.set(this.parsed, key, value);
    }
    return this.parsed;
  }

  /**
   * Constructs and return an object of flags and their types for
   * consumption by the command
   * @property module:lib/command.Command.conf
   * @type object
   **/
  get conf(){

    if( this._optcache ){
      return this._optcache;
    }

    this._optcache = {};
    this._required = [];
    Object.keys( this.options.flags ).forEach(( key ) => {
      let value = this.options.flags[ key ];
      this._optcache[key] = value.type;
      if (value.required) {
        this._required.push( key );
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

  invalidHandler(key, value, type) {
    const color = chalk[conf.get('color')];
    const got = color(typeOf(value));
    const expected = color(typeOf(type));
    const msg = `${chalk.white('Expected')} ${expected} got ${got}`;
    const error = new exceptions.InvalidFieldException(
      `Invalided Field Value for ${chalk.yellow(key)} - ${msg}`
    );
    this.emit('error', error);
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
  async interactive( cmd ){
    let that = this, flags;
    flags = Object
      .keys(this.options.flags)
      .filter( function( flag ){
        return stop_flags.indexOf( flag ) == -1;
      });

    const answers = Object.create(null);
    const args = [];
    while (flags.length) {
      const flag = flags.shift();
      const current = that.options.flags[flag];
      if (Array.isArray(current.type)) {
        answers[flag] = await ask(flag, cmd, current);
        continue
      }
      const arg = toQuestion(flag, cmd, current, answers);
      Object.assign(answers, await inquirer.prompt(arg));
    }

    this.parsed = Object.assign( this.parsed, answers );

    for( let answer in answers ){
      args.push( `--${answer}=${answers[answer]}` );
      object.set(this.parsed, answer, answers[answer]);
    }

    this.setOptions({
      args: args
    });
    this.validate(cmd);
    this.dispatch();
    return this.options.run.call(this, cmd, this.argv);
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
  async run( cmd ){
    var content = null
      , directive // the first non-flag directive passed to the command
      ;

    nopt.invalidHandler = this.invalidHandler.bind(this);

    directive = this.argv.argv.remain[1];
    cmd = cmd ? cmd : directive || null;

    if( this.argv.interactive ) {
      if( this.options.interactive ){
        this.dispatch();
        content = await this.interactive.call( this, cmd );
        content = !!this.argv.color ? content : strip( content );
        /**
         * dispatched when the command has sucessfully completed
         * @name command.Command#content
         * @event
         * @param {Error} e
         */
        this.emit('content', content);
        return content
      } else {
        console.error( chalk.yellow('interactive mode - not availible\n') );
        return null
      }
    }

    this.validate( cmd );
    this.dispatch();
    const result = await this.options.run.call(this, cmd, this.argv);
    return !!this.argv.color ? result : strip( result );
  }

  /**
   * Validates the current data set before running the command
   * @method module:seel/lib/command#validate
   * @param {String} [command] The name of the command being executed
   * @throws module:seeli/lib/exceptions/InvalidFieldException
   * @throws module:seeli/lib/exceptions/RequiredException
   **/
  validate( cmd ){
    let UNDEF;
    Object
      .keys(this.options.flags)
      .filter(( flag ) => {
        return !stop_flags.includes(flag);
      })
      .forEach(( flag ) => {
        var cfg = this.options.flags[flag]
          , validator = cfg.validate
          , isValid
          ;

        if( this._required.indexOf(flag) >= 0 && this.parsed[flag] === UNDEF ){
          throw new exceptions.RequiredFieldException( flag );
        }

        isValid = validator ? validator.call(null, cmd, this.parsed ) : true;

        if(isValid === false ){
          throw new exceptions.InvalidFieldException(`${flag} failed validation.`);
        }

        if( typeof isValid == 'string'){
          throw new exceptions.InvalidFieldException( `${flag} - ${isValid}` );
        }
      });
  }

  /**
   * Pass through function to inquirer for prompting input at the terminal
   * @method module:seeli/lib/command#prompt
   * @param {Object} options Inquirer prompt options
   * @returns {Promise} Promise object representing the end user input from the question
   **/
  prompt(opts) {
    return inquirer.prompt(opts)
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

async function ask(name, cmd, opts) {
  const results = [];
  const arg = toQuestion(name, cmd, opts);
  while (true) {
    const answer = await inquirer.prompt( arg );
    if ( answer[name] === '' ) break
    results.push(answer[name]);
  }
  return results
}

function toQuestion(flag, cmd, opts, answers) {
  const arg = {
    type: opts.type === Boolean ? 'confirm' : opts.mask ? 'password' : 'input'
  , name: flag
  , message: flag + ' : ' + (opts.description || '(no description)')
  , default: opts.default || null
  };

  // TODO(esatterwhite)
  // wrap validate to throw returned errors so `ask`
  // can return them
  arg.when     = opts.when     ? opts.when.bind( null, answers) : undefined;
  arg.validate = opts.validate ? opts.validate.bind( null, answers ) : undefined;
  arg.filter   = opts.filter   ? opts.filter.bind( null, answers ) : undefined;

  if( opts.choices ){
    arg.type = 'list';
    arg.choices = opts.choices;
  }
  return arg;
}
