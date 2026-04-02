'use strict'

const {checkbox, confirm, input, number, password, select} = require('@inquirer/prompts')

module.exports = new Map([
  ['checkbox', checkbox]
, ['confirm', confirm]
, ['input', input]
, ['number', number]
, ['password', password]
, ['select', select]
, ['multiselect', checkbox]
, ['text', input]
])
