'use strict'

const path = require('path')
const pkgup = require('pkg-up')
const set = require('mout/object/set')
const get = require('mout/object/get')
const isObject = require('mout/lang/isPlainObject')
const debug = require('debug')('seeli:conf')
const CWD = process.cwd()
const filename = process.argv[1]

const name = filename
  ? path.basename(filename, '.js')
  : 'seeli'

let config = {
  color: 'green'
, name: name
, help: path.resolve(path.join(__dirname, 'commands', 'help'))
, exitOnError: false
, exitOnContent: false
}

try {
  const cwd = get(require, 'main.path') || CWD
  const pkgjson = pkgup.sync({cwd})
  debug('loading configuration from %s', pkgjson)
  const pkg = require(pkgjson)
  const override = pkg.seeli || {}
  const help = resolveHelp(override.help, cwd)
  config = {
    ...config
  , ...override
  , help: help
  }
} catch (e) {
  debug('unable to load configuration. using config', e)
}

module.exports = {
  get: (key) => {
    return get(config, key)
  }

, set: (key, value) => {
    if (!isObject(key)) return set(config, key, value)

    for (const [k, v] of Object.entries(key)) {
      set(config, k, v)
    }
  }
}

function resolveHelp(location, cwd) {
  if (!location) return config.help
  if (path.isAbsolute(location)) return config.help
  return path.join(cwd, location)
}
