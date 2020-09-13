'use strict'

const os = require('os')
const path = require('path')
const set = require('mout/object/set')
const get = require('mout/object/get')
const chalk = require('chalk')
const isObject = require('mout/lang/isPlainObject')
const filename = process.argv[1]

let username = 'seeli'
let host = 'local'

try {
  const info = os.userInfo()
  host = os.hostname()
  username = info.username
} catch (_) {}

const PS1 = `${username}@${host}`
const name = filename ? path.basename(filename, '.js') : 'seeli'

const defaults = {
  color: 'green'
, prompt: `[${chalk.green(PS1)} ${chalk.bold(name)}]$ `
, name: name
, help: path.resolve(path.join(__dirname, 'commands', 'help'))
, exitOnError: true
, exitOnContent: true
}

exports.get = function(key) {
  return get(defaults, key)
}

exports.set = function(key, value) {
  if (!isObject(key)) return set(defaults, key, value)

  for (const [k, v] of Object.entries(key)) {
    set(defaults, k, v)
  }
}
