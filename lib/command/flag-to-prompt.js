'use strict'

const flagType = require('./flag-type')
const invertWhen = require('./invert-when')

module.exports = flagToPrompt

function flagToPrompt(name, opt = {}) {
  const display = name.replace(':', ' ')
  const t = flagType(opt)

  return {
    type: t
  , name: name
  , message: display + ': ' + (opt.description || '(no description)')
  , choices: opt.choices
  , initial: opt.default || null
  , skip: invertWhen(opt.when)
  , result: opt.filter
  , format: opt.transformer
  , affirmative: opt.affirmative
  , negative: opt.negative
  }
}
