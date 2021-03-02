'use strict'

const chalk = require('chalk')
const toArray = require('mout/lang/toArray')
const kindOf = require('mout/lang/kindOf')
const Command = require('./command')
const config = require('./conf.js')
const {PluginException} = require('./exceptions.js')

class Seeli extends Command {
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

  config(key, value) {
    if (value) return config.set(key, value)
    return config.get(key)
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
