'use strict'

const {checkbox, confirm, input, number, password, select} = require('@inquirer/prompts')

module.exports = new Map([
  ['checkbox', select]
, ['confirm', confirm]
, ['input', input]
, ['number', number]
, ['password', password]
, ['select', checkbox]
, ['multiselect', checkbox]
, ['text', input]
])
