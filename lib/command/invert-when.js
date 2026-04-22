'use strict'
const kindOf = require('mout/lang/kindOf')
/**
 * In switching from inquierer to enquierer
 * the way to skip a question was inverted from the positive
 * to the negetive (skip vs when). This maintains the behavior of when
 **/

module.exports = invertWhen

function invertWhen(fn) {
  if (fn === undefined || fn === null) return undefined

  return (...args) => {
    switch (kindOf(fn)) {
      case 'Boolean': {
        return !fn
      }
      case 'AsyncFunction': {
        return fn(...args).then((value) => { return !value })
      }

      case 'Function': {
        const value = fn(...args)
        return !value
      }
    }
  }
}
