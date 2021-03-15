'use strict'

/**
 * Returns the inpute type for a command flag
 * @module seeli/lib/usage/type-of
 * @author Eric Satterwhite
 * @since 7.0.0
 * @requires path
 * @requires url
 * @requires mout/lang/kindOf
 * @requires mout/lang/isFunction
 * @example const typeOf = require('seel/lib/lang/type-of')
 * typeOf(Number) // number
 * typeOf(require('url')) // url
 * typeOf(require('path')) // path
 * typeOf([Number]) // number*
 * typeOf([String]) // string*
 **/

const path = require('path')
const url = require('url')
const kindOf = require('mout/lang/kindOf')
const isFunction = require('mout/lang/isFunction')

module.exports = typeOf

function typeOf(thing) {
  /* eslint-disable eqeqeq */
  if (thing == path) {
    return 'path'
  } else if (thing == url) {
    return 'url'
  } else if (typeof thing === 'number' && isNaN(thing)) {
    return 'NaN'
  } else if (Array.isArray(thing)) {
    const clean = thing.filter((item) => {
      return item !== Array
    })
    return typeOf(clean[0]).toLowerCase() + '*'
  } else if (isFunction(thing)) {
    return typeOf(thing()).toLowerCase()
  } else {
    return kindOf(thing).toLowerCase()
  }
  /* eslint-enable eqeqeq */
}
