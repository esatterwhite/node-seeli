'use strict'
/**
 * Command registry for seeli
 * @module module:seeli/lib/registry
 * @author Eric Satterwhite
 * @since 9.0.0
 * @requires events
 * @requires abbrev
 * @requires seeli/lib/conf
 * @requires mout/lang/toArray
 * @requires mout/object/fillIn
 * @requires seeli/lib/usage/type-of
 */

const {EventEmitter} = require('events')
const abbrev = require('abbrev')
const debug = require('debug')('seeli:commands')
const toArray = require('mout/lang/toArray')
const fill = require('mout/object/fillIn')
const typeOf = require('./usage/type-of')

/**
 * Copy properties from source to target object
 * @param {Object} target - Target object to copy to
 * @param {Object} source - Source object to copy from
 * @returns {void}
 * @private
 */
function copyProperties(target, source) {
  for (const key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      const desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

/**
 * Mix multiple classes together
 * @param {Function} Base - Base class to extend
 * @param {...Function} mixins - Mixin classes to apply
 * @returns {Function} New class with mixed-in properties
 * @private
 */
function mix(Base, ...mixins) {
  class Mix extends Base {}
  for (const mixin of mixins) {
    copyProperties(Mix, mixin)
    copyProperties(Mix.prototype, mixin.prototype)
  }
  return Mix
}

/**
 * Command registry that maps command names to command instances
 * @constructor
 * @alias module:seeli/lib/registry
 * @extends Map
 * @extends EventEmitter
 */
class Registry extends mix(Map, EventEmitter) {

  /**
   * Create a Registry instance
   */
  constructor() {
    super()
    EventEmitter.call(this)
    /**
     * Set of registered command names
     * @type {Set<string>}
     */
    this.names = new Set()
  }

  /**
   * Resolve a command by key (shallow lookup)
   * @param {string|string[]} key - Command name or path array
   * @returns {Command|undefined} The command instance or undefined
   */
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

  /**
   * Resolve a command by key (deep lookup)
   * @param {string|string[]} key - Command name or path array
   * @returns {Command|undefined} The command instance or undefined
   */
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

  /**
   * Register a command with the registry
   * @param {string|Command} name - Command name or Command instance
   * @param {Command} [cmd] - Command instance if name is a string
   * @returns {void}
   */
  register(name, cmd) {
    let _name = name
    let _command = cmd

    const is_command = typeOf(name) === 'command'
    if (is_command) {
      _command = _name
      _name = _command.options.name
    }

    if (!_command.options.name) _command.options.name = _name
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

  /**
   * Unregister a command from the registry
   * @param {string} name - Command name to unregister
   * @returns {Registry} this instance for chaining
   */
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
   * Get a list of all registered command names
   * @returns {string[]} Array of command names
   */
  list() {
    return Array.from(this.names)
  }

  /**
   * Clear all registered commands
   * @returns {Registry} this instance for chaining
   */
  clear() {
    this.names.clear()
    super.clear()
    return this
  }
}

module.exports = Registry
