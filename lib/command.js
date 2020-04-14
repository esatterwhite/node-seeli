/*jshint laxcomma:true, smarttabs: true, node: true, esnext: true, unused: true */

'use strict';
/**
 * Base command class for creating interactive cli programs
 * @module module:lib/command
 * @author Eric Satterwhite
 * @requires options
 * @requires events
 * @requires os
 * @requires inquirer
 * @requires nopt
 * @requires chalk
 * @requires debug
 * @requires strip-ansi
 * @requires mout/array/append
 * @requires mout/lang/toArray
 * @requires mout/object/hasOwn
 * @requires seeli/lib/usage
 * @requires seeli/lib/exceptions
 * @requires seeli/lib/conf
 * @requires seeli/lib/lang/object
 **/
const  os           = require('os')
     , tty          = require('tty')
     , events       = require('events')
     , inquirer     = require('inquirer')
     , nopt         = require('nopt')
     , chalk        = require('chalk')
     , strip        = require('strip-ansi')
     , debug        = require('debug')
     , ora          = require('ora')
     , array        = require('mout/array')
     , toArray      = require('mout/lang/toArray')
     , hasOwn       = require('mout/object/hasOwn')
     , conf         = require('./conf')
     , usage        = require('./usage')
     , object       = require('./lang/object')
     , typeOf       = require('./usage/type-of')
     , exceptions   = require('./exceptions')
     , stop_flags   = ['help', 'interactive', 'skip','color']
     , ARGV         = 'argv'
     , on_exp       = /^on([A-z])/
     , noop         = () => { return Promise.resolve(null); }
     , kPrompt      = Symbol.for('kPrompt')
     ;

function removeOn(name) {
  return name.replace(on_exp, (full, first) => {
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
, ui: 'dots'
, flags: {
    interactive: {
      type: Boolean
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
 * @param {String} [options.ui="dots"] ui progress indicator
 * @param {Object} [options.flags] cli flags. top level keys will be used as the long hand flag
 * @param {Function} [options.run] A function that will be used as the primary drive of the command. It should perform what ever action the command was intended to do
 * @example var hello = new Command({
    options:{
      description:"diaplays a simple hello world command"
    , usage:[
      "Usage: cli hello --interactive"
    , "Usage: cli hello --name=john"
    , "Usage: cli hello --name=john --name=marry --name=paul -v screaming"
    ]
  , flags:{
      name:{
        type:[ String, Array ]
      , shorthand:'n'
      , description:"The name of the person to say hello to"
      }
    , excited: {
        type:Boolean
      , shorthand: 'e'
      , description:"Say hello in a very excited manner"
      , default:false
      }
    , volume:{
        type:String
      , choices:['normal', 'screaming']
      , default:'normal'
      , shorthand:'v'
      }
    }
  , run: async ( cmd, data ) => {
      const out = [];
      this.ui.start('processing names');
      var names = Array.isArray( data.name ) ? data.name : [ data.name ];
      for( var x = 0; x < names.length; x++ ){
        this.ui.text = (`processing ${names[x]}`)
        await new Promise((resolve) => {
          setTimeout(() => {
            let value = "Hello, " + names[x];
            if( data.excited ){
              value += '!';
            }
            out.push( data.volume === 'screaming' ? value.toUpperCase() : value );
            resolve(true);
          }, 1000 * x + 1);
        });
      }

      ui.succeed('names processed successfully');

      return out
    }
  }
 });
 */
class Command extends events.EventEmitter {
  constructor (...options){
    super();
    events.EventEmitter.call(this);
    this._shcache     = null;
    this._optcache    = null;
    this.parsed       = null;
    this.options      = Object.create(null);
    this.reset();

    this.setOptions(defaults, ...options);

    this[kPrompt]     = inquirer.createPromptModule(this.options.inquirer)
    this.ui = ora({
      color: conf.get('color')
    , spinner: this.options.ui
    , text: 'loading'
    , stream: process.stdout
    });

    this.debug = debug(`${conf.get('name')}:${this.options.name}`);
    this.debug('strict mode: %s', this.options.strict);
  }

  get [Symbol.toStringTag]() {
    return 'Command'
  }

  /**
   * constructs and retuns the final command usage
   * @property usage
   * @type string
   **/
  get usage(){
    const out = usage.from(
      this.options.flags
    , null
    , this.options.interactive
    );
    return array.append(
      toArray(this.options.usage),
      [
        ''
        , !!out ? `Options:${os.EOL}` : ''
        , out
      ]
    ).join(os.EOL);
  }

  /**
   * The description of the command
   * @property description
   * @type String
   **/
  get description() {
    return this.options.description;
  }

  /**
   * the final parsed out command line input as key/value pairs
   * @property module:lib/command.Command.argv
   * @type object
   * @throws module:seeli/lib/exceptions/UnknownFlagException
   **/
  get argv() {
    let slice = 2
    let args = process.argv
    if (this.parsed) {
      return this.parsed;
    }

    if (this.options.args) {
      args = this.options.args
      slice = 0
    }

    this.parsed = nopt(this.conf, this.shorthands, args, slice);
    const keys = new Set(Object.keys(this.options.flags).concat(Object.keys(this.parsed)));

    for (const key of keys) {
      if (key === ARGV) continue;
      const flag = this.options.flags[key];

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
    for (const [key, value] of Object.entries(this.options.flags)) {
      this._optcache[key] = value.type;
      if (value.required) {
        this._required.push( key );
      }
    }
    return this._optcache;
  }

  /**
   * Maps and returns any shorthand switchs to their parent
   * flags for consumptions by the command
   * @property module:lib/command.Command.shorthands
   * @type object
   **/
  get shorthands( ){
    if(this._shcache) return this._shcache;
    this._shcache = Object.create(null);

    for (const [key, value] of Object.entries(this.options.flags)) {
      if (value.shorthand) this._shcache[value.shorthand] = [`--${key}`];
    }

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
    this.options = object.merge.apply(null, [{}, super.options || {}, this.options || {}, ...opts]);
    let options  = this.options;
    if (this.addListener) {
      for(var opt in options){
        if(on_exp.test(opt) && typeof(options[opt]) == 'function' ) {
          this.addListener(removeOn(opt), options[opt]);
          delete options[opt];
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
    for(const [flag, opt] of Object.entries(this.options.flags)) {
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
  async interactive(cmd){
    const args = [];
    const answers = Object.create(null);
    const flags = Object.keys(
      this.options.flags
    )
    .filter( function( flag ){
      return !stop_flags.includes( flag );
    });

    while (flags.length) {
      const flag = flags.shift();
      const current = this.options.flags[flag];
      if (current.interactive === false) continue
      if (Array.isArray(current.type)) {
        answers[flag] = await ask(flag, cmd, current, this[kPrompt]);
        continue;
      }
      const arg = toQuestion(flag, cmd, current, answers);
      const res = await this.prompt(arg)
      Object.assign(answers, res);
    }

    this.parsed = Object.assign(this.parsed, answers);

    for(const [flag, answer] of Object.entries(answers)) {
      args.push( `--${flag}=${answer}` );
      object.set(this.parsed, flag, answer);
    }

    this.setOptions({ args: args });
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
    nopt.invalidHandler = this.invalidHandler.bind(this);

    const directive = this.argv.argv.remain[1];
    cmd = cmd ? cmd : directive || null;

    if( this.argv.interactive ) {
      if( this.options.interactive ){
        this.dispatch();
        const result = await this.interactive.call( this, cmd );
        const content = !!this.argv.color ? result : strip( result );
        /**
         * dispatched when the command has sucessfully completed
         * @name command.Command#content
         * @event
         * @param {Error} e
         */
        this.emit('content', content);
        return content;
      } else {
        const name = this.options.name
        const error = new exceptions.CommandException(`command ${name} does not support interactive mode`)
        throw error
      }
    }

    this.validate( cmd );
    this.dispatch();
    const result = await this.options.run.call(this, cmd, this.argv);
    this.ui.stop();
    const content = !!this.argv.color ? result : strip( result );
    this.emit('content', content);
    return content;
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
    const flags = this.options.flags;
    for (const [flag, cfg] of Object.entries(flags)) {
      if (stop_flags.includes(flag)) continue;
      const cfg = this.options.flags[flag]
      const validator = cfg.validate

      if (this._required.includes(flag) && this.parsed[flag] === UNDEF) {
        throw new exceptions.RequiredFieldException(flag);
      }

      const isValid = validator ? validator.call(null, cmd, this.parsed) : true;

      if (isValid === false) {
        throw new exceptions.InvalidFieldException(`${flag} failed validation.`);
      }

      if (typeof isValid == 'string') {
        throw new exceptions.InvalidFieldException( `${flag} - ${isValid}` );
      }
    }
  }

  /**
   * Pass through function to inquirer for prompting input at the terminal
   * @method module:seeli/lib/command#prompt
   * @param {Object} options Inquirer prompt options
   * @returns {Promise} Promise object representing the end user input from the question
   **/
  prompt(opts) {
    const prompt = this[kPrompt]
    return prompt(opts);
  }

  /**
   * Colorizes a text blob
   * @method module:seeli/lib/command#colorize
   * @param {String} color The color to use. can be one of `red`, `blue`,`green`, `yellow`,`bold`, `grey`, `dim`, `black`, `magenta`, `cyan`
   * @param {String} text text to colorize
   * @returns {String} colorized version of the text
   **/
  colorize(color, text) {
    return (this.argv.color && chalk[color]) ? chalk[color](text) : text;
  }

}

module.exports = Command;

async function ask(name, cmd, opts, inquirer) {
  const results = [];
  const question = toQuestion(name, cmd, opts);
  while (true) {
    const answer = await inquirer(question);
    if (answer[name] === '') break;
    results.push(answer[name]);
  }
  return results;
}

function toQuestion(flag, cmd, opts, answers) {
  const flag_display = flag.replace(':', ' ');
  const arg = {
    type: opts.type === Boolean ? 'confirm' : opts.mask ? 'password' : 'input'
  , name: flag
  , message: flag_display + ': ' + (opts.description || '(no description)')
  , default: opts.default || null
  };

  // TODO(esatterwhite)
  // wrap validate to throw returned errors so `ask`
  // can return them
  arg.when     = opts.when     ? opts.when.bind(null, answers) : undefined;
  arg.validate = opts.validate ? opts.validate.bind(null, answers) : undefined;
  arg.filter   = opts.filter   ? opts.filter.bind(null, answers) : undefined;

  if( opts.choices ){
    arg.type = opts.multi ? 'checkbox' : 'list';
    arg.choices = opts.choices;
  }

  return arg;
}


