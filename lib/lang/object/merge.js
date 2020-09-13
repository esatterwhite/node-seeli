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
const hasOwn = require('mout/object/hasOwn')

module.exports = function merge(...args) {
  let i = 1
  , key
  , val
  , obj


  // make sure we don't modify source element and it's properties
  // objects are passed by reference
  const target = clone(args[0])
  while (obj = args[i++]) {
    for (key in obj) {
      if (!hasOwn(obj, key)) continue

      val = obj[key]
      if (isObject(val) && isObject(target[key])) {
        // inception, deep merge objects
        target[key] = merge(target[key], val)
      } else {
        const is_url = val && val.type === url
        const is_path = val && val.type === path

        // make sure arrays, regexp, date, objects are cloned
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
