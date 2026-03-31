'use strict'

const flagType = require('./flag-type')
const invertWhen = require('./invert-when')

module.exports = flagToPrompt

function toChoice(choice) {
  return typeof choice === 'string' ? {name: choice, value: choice} : choice
}

function flagToPrompt(name, opt = {}) {
  const display = name.replace(':', ' ')

  const flag_type = flagType(opt)
  return {
    'type': flag_type
  , 'name': name
  , 'message': display + ': ' + (opt.description || '(no description)')
  , 'choices': Array.isArray(opt.choices) ? opt.choices.map(toChoice) : undefined
  , 'default': opt.default || null
  , 'skip': invertWhen(opt.when)
  , 'filter': opt.filter
  , 'transformer': opt.transformer
  , 'mask': flag_type === 'password' ? true : undefined
  }
}
