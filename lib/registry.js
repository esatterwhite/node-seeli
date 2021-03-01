'use strict'
/**
 * Command this for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 9.0.0
 * @requires abbrev
 * @requires seeli/lib/conf
 * @requires mout/lang/toArray
 * @requires mout/object/fillIn
 */

const {EventEmitter} = require('events')
const abbrev = require('abbrev')
const debug = require('debug')('seeli:commands')
const toArray = require('mout/lang/toArray')
const fill = require('mout/object/fillIn')
const typeOf = require('./usage/type-of')


function copyProperties(target, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      const desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

function mix(Base, ...mixins) {
  class Mix extends Base {}
  for (const mixin of mixins) {
    copyProperties(Mix, mixin)
    copyProperties(Mix.prototype, mixin.prototype)
  }
  return Mix
}

class Registry extends mix(Map, EventEmitter) {

  constructor() {
    super()
    EventEmitter.call(this)
    this.names = new Set()
  }

  resolveShallow(key) {
    let depth = 0
    let cmd = this // eslint-disable-line consistent-this
    const names = toArray(key)
    if (!names.length) return
    if (cmd.has(names[0])) return cmd.get(names[0])
    while (depth < names.length) {
      cmd = cmd.get(names[depth])
      depth += 1
      if (!cmd) break
    }

    return cmd
  }

  resolve(key) {

    let depth = 0
    let cmd = this // eslint-disable-line consistent-this
    const names = toArray(key)
    if (!names.length) return
    while (depth < names.length) {
      cmd = cmd.get(names[depth])
      depth += 1
      if (!cmd) break
    }

    return cmd
  }

  register(name, cmd) {
    let _name = name
    let _command = cmd

    const is_command = typeOf(name) === 'command'
    if (is_command) {
      _command = _name
      _name = _command.options.name
    }
    const abbrevs = abbrev(_name)
    const alias = _command.options.alias

    if (alias) {
      debug('registering %s with aliases', _name, alias)
      for (const abbr of toArray(alias)) {
        fill(abbrevs, abbrev(abbr))
      }
    }
    // generate short hand commands
    // that are accessable but not enumerable.
    // really just for typo support.

    for (const abbr of Object.keys(abbrevs)) {
      if (!this.has(abbr)) {
        if (abbr === _name) {
          this.names.add(abbr)
        }
        debug('register shorthand %s for %s', abbr, _name)
        this.set(abbr, _command)
      }
    }
  }

  unregister(name) {
    const cmd = this.get(name)
    if (!cmd) return this

    cmd.reset()
    cmd.removeAllListeners()

    const abbrevs = abbrev(name)
    const alias = cmd.options.alias
    if (alias) {
      for (const abbr of toArray(alias)) {
        fill(abbrevs, abbrev(abbr))
      }
    }

    for (const key of Object.keys(abbrevs)) {
      this.names.delete(key)
      this.delete(key)
    }
    return this
  }

  /**
   * @memberof module:seeli/lib/commands
   * @property {Array} list A list of all registered commands
   **/
  list() {
    return Array.from(this.names)
  }

  clear() {
    this.names.clear()
    super.clear()
    return this
  }
}

module.exports = Registry
