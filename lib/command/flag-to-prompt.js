'use strict'

const flagType = require('./flag-type')
const kindOf = require('mout/lang/kindOf')
module.exports = flagToPrompt

/**
 * In switching from inquierer to enquierer
 * the way to skip a question was inverted from the positive
 * to the negetive (skip vs when). This maintains the behavior of when
 **/
function invertWhen(fn) {
  if (!fn) return undefined
  return (...args) => {
    switch(kindOf(fn)) {
      case 'Boolean': {
        return !fn
      }
      case 'AsyncFunction': {
        return fn(...args).then((value) => {return !value})
      }

      case 'Function': {
        const value = fn(...args)
        return !value
      }
    }
  }
}

function flagToPrompt(name, opt = {}) {
  const display = name.replace(':', ' ')
  const t = flagType(opt)


  return {
    'type': t
  , 'name': name
  , 'message': display + ': ' + (opt.description || '(no description)')
  , 'choices': opt.choices
  , 'initial': opt.default || null
  , 'skip': invertWhen(opt.when)
  , 'result': opt.filter
  , 'format': opt.transformer
  , 'affirmative': opt.affirmative
  , 'negative': opt.negative
  }
}
