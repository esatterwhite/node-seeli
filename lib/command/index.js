'use strict'

/**
 * Base command class for creating interactive cli programs
 * @module module:seeli/lib/command
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

const tty = require('tty')
const inquirer = require('inquirer')
const nopt = require('nopt')
const chalk = require('chalk')
const strip = require('strip-ansi')
const debug = require('debug')
const toArray = require('mout/lang/toArray')
const isFunction = require('mout/lang/isFunction')
const hasOwn = require('mout/object/hasOwn')
const typecast = require('mout/string/typecast')
const toPrompt = require('./flag-to-prompt')
const flagType = require('./flag-type')
const Registry = require('../registry')
const conf = require('../conf')
const ora = require('../ora')
const usage = require('../usage')
const object = require('../lang/object')
const typeOf = require('../usage/type-of')
const exceptions = require('../exceptions')
const colorize = require('../colorize')
const stop_flags = new Set(['help', 'interactive', 'skip', 'color'])
const ARGV = 'argv'
const on_exp = /^on([A-z])/
const kPrompt = Symbol.for('kPrompt')

function noop() {
  return Promise.resolve(null)
}

function removeOn(name) {
  return name.replace(on_exp, (_, first) => {
    return first.toLowerCase()
  })
}

const defaults = {
  description: ''
, usage: ''
, strict: false
, args: null
, interactive: true
, name: null
, ui: 'dots'
, commands: []
, flags: {
    interactive: {
      'type': Boolean
    , 'shorthand': 'i'
    , 'default': false
    , 'description': 'Use the interactive propmts'
    }
  , color: {
      'type': Boolean
    , 'description': 'Enable ANSI color in output'
    , 'default': true
    , 'skip': true
    }
  }
, run: noop
}


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
class Command extends Registry {
  constructor(...options) {
    super()
    this._shcache = null
    this._optcache = null
    this.parsed = null
    this.options = Object.create(null)
    this[kPrompt] = inquirer.createPromptModule()
    this.reset()

    const subcommands = options.reduce((acc, opts) => {
      if (!opts) return acc
      acc.push(...toArray(opts.commands))
      opts.commands = null
      return acc
    }, [])

    options.commands = null

    this.setOptions(defaults, ...options)

    this._shcache = this.shorthands
    this.ui = ora({
      color: conf.get('color')
    , spinner: this.options.ui
    , text: 'loading'
    , stream: process.stdout
    })

    for (const sub of subcommands) this.use(sub)
    this.debug = debug(`${conf.get('name')}:${this.options.name}`)
    this.debug('strict mode: %s', this.options.strict)
  }

  get [Symbol.toStringTag]() {
    return 'Command'
  }

  /**
   * constructs and retuns the final command usage
   * @property usage
   * @type string
   **/
  get usage() {
    return usage.from(this)
  }

  /**
   * The description of the command
   * @property description
   * @type String
   **/
  get description() {
    return this.options.description
  }

  /**
   * the final parsed out command line input as key/value pairs
   * @property module:lib/command.Command.argv
   * @type object
   * @throws module:seeli/lib/exceptions/UnknownFlagException
   **/
  get argv() {
    if (this.parsed) return this.parsed

    let slice = 2
    let args = process.argv
    if (this.options.args) {
      args = this.options.args
      slice = 0
    }

    this.parsed = nopt(this.conf, this.shorthands, args, slice)
    const keys = new Set([
      ...Object.keys(this.options.flags)
    , ...Object.keys(this.parsed)
    ])

    for (const key of keys) {
      if (key === ARGV) continue
      const flag = this.options.flags[key]

      if (!flag) {
        if (!this.options.strict) continue

        const error = new exceptions.UnknownFlagException(key)
        if (tty.isatty()) console.log(this.usage)
        this.emit('error', error)

        return this.parsed
      }
      const value = hasOwn(this.parsed, key) ? this.parsed[key] : flag.default
      object.set(
        this.parsed
      , key
      , typeof flag.filter === 'function' ? flag.filter(value, this.parsed) : value
      )
    }
    return this.parsed
  }

  /**
   * Constructs and return an object of flags and their types for
   * consumption by the command
   * @property module:lib/command.Command.conf
   * @type object
   **/
  get conf() {

    if (this._optcache) return this._optcache

    this._optcache = {}
    this._required = new Set()

    for (const [key, value] of Object.entries(this.options.flags)) {
      this._optcache[key] = value.type
      if (value.required) this._required.add(key)
    }

    return this._optcache
  }

  /**
   * Maps and returns any shorthand switchs to their parent
   * flags for consumptions by the command
   * @property module:lib/command.Command.shorthands
   * @type object
   **/
  get shorthands() {
    if (this._shcache) return this._shcache
    this._shcache = Object.create(null)

    for (const [key, value] of Object.entries(this.options.flags)) {
      if (value.shorthand) {
        if (hasOwn(this._shcache, value.shorthand)) {
          const [previous] = this._shcache[value.shorthand]
          throw new exceptions.DuplicateShorthandException(
            value.shorthand
          , key
          , previous.replace('--', '')
          )
        }
        this._shcache[value.shorthand] = [`--${key}`]
      }
    }

    return this._shcache
  }

  invalidHandler(key, value, type) {
    const got = colorize(typeOf(value))
    const expected = colorize(typeOf(type))
    const msg = `${chalk.white('Expected')} ${expected} got ${got}`
    const error = new exceptions.InvalidFieldException(
      `Invalided Field Value for ${chalk.yellow(key)} - ${msg}`
    )
    throw error
  }

  /**
   * merges passing in object as configuration overrides
   * @param {Object} [options] Configuration overrides to set
   */
  setOptions(...opts) {
    this.options = object.merge.apply(null, [
      {}
    , super.options || {}
    , this.options || {}
    , ...opts
    ])

    const options = this.options

    if (this.addListener) {
      for (const [key, value] of Object.entries(options)) {
        if (on_exp.test(key) && isFunction(value)) {
          this.addListener(removeOn(key), options[key])
          delete options[key]
        }
      }
    }
    return this
  }

  /**
   * Dispatchs an event for each flag that has the event flag enabled
   * protected
   * @method module:lib/command.Command#dispatch
   **/
  dispatch() {
    for (const [flag, opt] of Object.entries(this.options.flags)) {
      if (!!opt.event) this.emit(flag, this.argv[ flag ])
    }

    return this
  }

  /**
   * Method used to setup and execute the commands interactie mode
   * @method module:seeli/lib/command.Command#interactive
   * @param {Object} [arg=null] Optional argument for your command specific usage
   * @param {Function} [callback] an optional callback to be executed when the command is complete.
   **/
  async interactive(cmd) {
    const args = []
    const answers = Object.create(null)
    const flags = Object.keys(
      this.options.flags
    )
      .filter(function(flag) {
        return !stop_flags.has(flag)
      })

    while (flags.length) {
      const flag = flags.shift()
      const current = this.options.flags[flag]
      if (current.interactive === false) continue
      if (Array.isArray(current.type)) {
        const previous = toArray(answers[flag])
        const [answer] = (await this.ask(flag, current))
        previous.push(...toArray(answer))
        answers[flag] = previous
        continue
      }
      const arg = toQuestion(flag, current, answers)
      const res = await this.prompt(arg)
      Object.assign(answers, res)
    }

    this.parsed = {...this.parsed, ...answers}

    for (const [flag, answer] of Object.entries(answers)) {
      if (Array.isArray(answer)) {
        for (const value of answer) {
          args.push(`--${flag}=${value}`)
        }
      } else {
        args.push(`--${flag}=${answer}`)
      }
      object.set(this.parsed, flag, answer)
    }

    // trigger nopt field validation
    nopt(this.conf, this.shorthands, args, 0)

    this.setOptions({
      args: args
    })

    this.validate()
    this.dispatch()
    const run = this.options.run
    if (typeof run !== 'function') return
    return this.options.run.call(this, cmd, this.parsed).finally(() => {
      this.ui.stop()
    })
  }

  /**
   * resets the internal command cache to its internal state
   * @chainable
   * @method module:seeli/lib/command.Command#reset
   * @return Command
   **/
  reset() {
    this._shcache = null
    this._optcache = null
    this.parsed = null
    this.options.args = null
    if (!Array.isArray(this.options.commands)) return this
    for (const cmd of this.options.commands) cmd.reset()
    return this
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
  async run(cmd, depth = 1) {
    this.debug('running command: %s, depth: %d', cmd, depth)
    nopt.invalidHandler = this.invalidHandler.bind(this)
    const directive = cmd || this.argv.argv.remain[depth]

    // Give me the child command that will process this.
    const sub = this.resolveShallow(this.argv.argv.remain.slice(depth))

    if (sub) {
      this.debug('delegating sub command %s', sub.options.name)
      const next = this.argv.argv.remain[depth + 1]
      return sub.run(next, depth + 1)
    }

    if (this.argv.interactive) {
      if (this.options.interactive) {
        this.dispatch()
        const result = await this.interactive.call(this, directive)
        const content = !!this.argv.color ? result : strip(result)
        /**
         * dispatched when the command has sucessfully completed
         * @name command.Command#content
         * @event
         * @param {String|Object} the final output returned from a command
         */
        this.emit('content', content)
        return content
      }

      const name = this.options.name
      const error = new exceptions.CommandException(
        `command ${name} does not support interactive mode`
      )
      throw error
    }

    this.validate(directive)
    this.dispatch()

    const result = await this.options.run.call(this, directive, this.argv).finally(() => {
      this.ui.stop()
    })

    const content = !!this.argv.color ? result : strip(result)
    this.emit('content', content)
    return content
  }

  /**
   * Validates the current data set before running the command
   * @method module:seel/lib/command#validate
   * @param {String} [command] The name of the command being executed
   * @throws module:seeli/lib/exceptions/InvalidFieldException
   * @throws module:seeli/lib/exceptions/RequiredException
   **/
  validate() {
    let UNDEF
    const flags = this.options.flags
    for (const [flag, cfg] of Object.entries(flags)) {
      if (stop_flags.has(flag)) continue
      const validator = cfg.validate
      const value = this.parsed[flag]
      const choices = getChoices(cfg, this.parsed, value)

      this.debug('validating %s', flag)
      if (this._required.has(flag) && value === UNDEF) {
        throw new exceptions.RequiredFieldException(flag)
      }

      const isValid = validator ? validator.call(null, this.parsed) : true
      if (choices.size && value !== UNDEF) {
        const values = toArray(value)
        for (const input of values) {
          const hasValue = toArray(input).every((val) => {
            return choices.has(val)
          })
          if (!hasValue) {
            const found = chalk.bold(input)
            const allow = colorize([...choices].join(', '))
            const key = colorize(flag)
            throw new exceptions.InvalidChoiceException(
              `${found} is not a valid choice option for ${key}. `
                + 'Valid choices: ' + allow
            )
          }
        }
      }

      if (isValid === false) {
        throw new exceptions.InvalidFieldException(`${flag} failed validation.`)
      }

      if (typeof isValid === 'string') {
        throw new exceptions.InvalidFieldException(`${flag} - ${isValid}`)
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
    return prompt(opts)
  }

  /**
   * Colorizes a text blob
   * @method module:seeli/lib/command#colorize
   * @param {String} color The color to use. can be one of `red`, `blue`,`green`, `yellow`,`bold`, `grey`, `dim`, `black`, `magenta`, `cyan`
   * @param {String} text text to colorize
   * @returns {String} colorized version of the text
   **/
  colorize(color, text) {
    return (this.argv.color && chalk[color]) ? chalk[color](text) : text
  }

  /**
   * Registers a new sub command
   * @method module:seeli/lib/command#use
   * @param {module:seeli/lib/command} command The command to register
   **/
  use(...args) {
    return this.register(...args)
  }

  /**
   * @typedef {Object} Prompt
   * @property {String} type
   * @property {String} name
   * @property {String} message
   * @property {?String[]} choices
   * @property {?String|Number|Boolean} default
   * @property {?Function} when
   * @property {?Function} validate
   * @property {?Function} filter
   **/

  /* istanbul ignore next */
  async ask(name, opts) {
    const results = []
    const question = toQuestion(name, opts)

    while (true) {
      const answer = await this[kPrompt](question)
      const value = typecast(answer[name])
      if (value === '') break
      if (question.type === 'number' && isNaN(value)) break
      results.push(value)
      if (!isRepeatable(opts)) break
    }
    return results
  }
  /**
   * Convert all registered flags to inquierer compatible prompt objects
   * @method module:seeli/lib/command#toPrompt
   * @returns {Prompt[]} array of inquirer prompt objects
   **/
  toPrompt() {
    const prompts = []
    const flags = this.options.flags
    for (const [name, opts] of Object.entries(flags)) {
      if (stop_flags.has(name)) continue
      if (opts.interactive === false) continue
      prompts.push(toPrompt(name, opts))
    }
    return prompts
  }

  get flags() {
    const flags = []
    for (const [name, flag] of Object.entries(this.options.flags)) {
      if (name === 'interactive' && !this.options.interactive) continue
      const type = flagType(flag)
      flags.push(`--${name}`)
      if (type === 'confirm') flags.push(`--no-${name}`)
    }
    return flags
  }

  get tree() {
    const root = Object.create(null)
    const flags = this.flags
    if (!this.names.size) return flags
    for (const name of this.names) {
      const cmd = this.get(name)
      root[name] = cmd.tree
    }
    root['--'] = flags
    root['-'] = flags
    return root
  }

  static run(...args) {
    const cmd = new(this)()
    return cmd.run(...args)
  }
}

module.exports = Command

function transform(input, answers, status) {
  if (!status.isFinal) return input
  if (this.type === 'number' && isNaN(input)) return ''
  return chalk.cyan(input)
}

function isRepeatable(flag) {
  if (flag.choices) return false
  if (flag.multi) return false
  return true
}

function toQuestion(flag, opts, answers) {
  const arg = toPrompt(flag, opts)

  // TODO(esatterwhite)
  // wrap validate to throw returned errors so `ask`
  // can return them
  arg.when = opts.when ? opts.when.bind(null, answers) : undefined
  arg.validate = opts.validate ? opts.validate.bind(null, answers) : undefined
  arg.filter = opts.filter ? opts.filter.bind(null) : undefined
  arg.transformer = opts.transformer ? opts.transformer : transform.bind(arg)
  return arg
}

function getChoices(cfg, answers) {
  return new Set(
    toArray(cfg.choices)
      .filter((choice) => {
        if (choice.type === 'separator') return false
        return true
      })
      .map((choice) => {
        if (typeOf(choice) === 'object') return choice.value
        return choice
      })
  )
}
