'use strict'
/**
 * @module module:seeli/lib/seeli
 * @requires mout/lang/toArray
 * @requires mout/lang/kindOf
 * @requires seeli/lib/command
 * @requires seeli/lib/conf
 **/
const chalk = require('chalk')
const toArray = require('mout/lang/toArray')
const kindOf = require('mout/lang/kindOf')
const Command = require('./command')
const config = require('./conf.js')
const colorize = require('./colorize.js')
const {PluginException} = require('./exceptions.js')

/**
 * Seeli Entrypoint used for registring and managing commands
 * @constructor
 * @alias module:seeli/lib/seeli
 * @extends module:seeli/lib/command
 **/
class Seeli extends Command {
  static get(...args) {
    return config.get(...args)
  }

  static set(...args) {
    return config.set(...args)
  }

  static colorize(txt, color) {
    return colorize(txt, color)
  }

  static get Command() {
    return Command
  }

  get Command() {
    return Command
  }

  constructor(...args) {
    super({
      color: 'green'
    , name: 'seeli'
    , plugins: toArray(config.get('plugins'))
    , flags: {
        help: {
          type: Boolean
        , shorthand: 'h'
        }
      , traceback: {
          type: Boolean
        }
      }
    }, ...args)

    this.plugin()
  }

  colorize(txt, color) {
    return colorize(txt, color)
  }

  config(...args) {
    const [key] = args
    if (args.length > 1) return config.set(...args)
    if (typeof key === 'object') return config.set(key)
    return config.get(...args)
  }

  run() {
    const parsed = this.argv
    // pull out the first non-flag argument
    let cmd = parsed.argv.remain.shift()
    // did the try to use the help command directly?
    const help = !!parsed.help
    if (help || cmd === 'help' || cmd == null) {
      if (!this.has('help')) {
        console.error('unknown command %s', cmd)
        console.error('know commands: %s ', Array.from(this.names).join(', '))
        process.exitCode = 1
        return
      }
      // allow for abbreviated commands
      cmd = (cmd === 'help' || cmd == null) ? parsed.argv.remain.shift() : cmd
      return this.get('help')
        .run(cmd)
        .then(onComplete.bind(this))
        .catch(onError.bind(this))
    }

    if (this.has(cmd)) {
      return this.get(cmd)
        .run(parsed.argv.remain.length ? parsed.argv.remain[0] : null)
        .then(onComplete.bind(this))
        .catch(onError.bind(this))
    }

    console.error('unknown command %s', cmd)
    console.error('know this: %s ', Array.from(this.names).join(', '))
    process.exitCode = 1
  }

  reset() {
    super.reset()
    for (const key of this.names) {
      this.unregister(key)
    }
    this.clear()
    return this
  }

  plugin(...args) {
    const plugins = args.length ? args : this.options.plugins
    for (const path of plugins) {
      const type = kindOf(path).toLowerCase()
      let plugin = null
      let plugin_name = path

      switch (type) {
        case 'string': {
          plugin_name = path
          plugin = require(path)
          break
        }

        case 'function': {
          plugin_name = path.name || 'inline plugin'
          plugin = path
          break
        }

        default: {
          throw new PluginException(
            `Invalid plugin. Must be of type string or function. Got ${type}`
          )
        }
      }

      this.debug('loading plugin %s', plugin_name)
      plugin.call(null, this)
    }

    return this
  }
}

module.exports = Seeli

function onError(err) {
  const parsed = this.argv
  console.error(`${chalk.red(err.name)}: ${err.message}`)
  if (parsed && parsed.traceback) {
    console.error(chalk.bold(chalk.red(err.stack)))
  } else {
    console.error('use --traceback for full stacktrace')
  }
  const code = isFinite(err.code) ? err.code : 1

  if (config.get('exitOnError')) {
    process.exit(code)
  }
  process.exitCode = code
}

function onComplete(content) {
  if (typeof content === 'string') console.log(content)
  if (config.get('exitOnContent')) process.exit(0)
}
