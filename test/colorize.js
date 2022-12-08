'use strict'
const {test} = require('tap')
const colorize = require('../lib/colorize')

test('colorize', async (t) => {
  t.throws(() => {
    colorize('test', 'fake:red')
  }, {name: 'InvalidColorModeException'}, 'invalid color mode')

  t.doesNotThrow(() => {
    colorize('test', 'red')
  }, {name: 'InvalidColorModeException'}, 'no color mode')

  t.doesNotThrow(() => {
    colorize('test', 'hex:#FF0000')
  }, 'valid color mode')
})
