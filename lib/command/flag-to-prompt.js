'use strict'

const flagType = require('./flag-type')

module.exports = flagToPrompt

function flagToPrompt(name, opt) {
  const display = name.replace(':', ' ')
  return {
    'type': flagType(opt)
  , 'name': name
  , 'message': display + ': ' + (opt.description || '(no description)')
  , 'choices': opt.choices
  , 'default': opt.default || null
  , 'when': opt.when
  , 'filter': opt.filter
  , 'transformer': opt.transformer
  }
}
