'use strict'
/**
 * Deep merge objects. except for path & url
 * this breaks nopt as it is comparing to those module objects
 * @module seeli/lib/lang/object/merge
 * @requires mout/lang/isObject
 * @requires mout/object/hasOwn
 */

const url = require('url')
const path = require('path')
const clone = require('clone')
const isObject = require('mout/lang/isObject')

module.exports = function merge(...args) {
  // make sure we don't modify source element and it's properties
  // objects are passed by reference
  const target = clone(args[0])
  for (const obj of args.slice(1)) {
    for (const [key, val] of Object.entries(obj)) {
      if (isObject(val) && isObject(target[key])) {
        // inception, deep merge objects
        target[key] = merge(target[key], val)
      } else {
        const is_url = val && val.type === url
        const is_path = val && val.type === path

        target[key] = clone(val)
        if (is_url) {
          target[key].type = url
        }

        if (is_path) {
          target[key].type = path
        }
      }
    }
  }
  return target
}
