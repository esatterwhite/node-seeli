'use strict'

const {test, threw} = require('tap')
const flagToPrompt = require('../lib/command/flag-to-prompt.js')

test('flagToPrompt', async (t) => {

  t.test('no description', async (t) => {
    const out = flagToPrompt('test:flag', {
      type: Boolean
    })

    t.match(out, {
      name: 'test:flag'
    , type: 'confirm'
    , message: 'test flag: (no description)'
    , when: undefined
    , filter: undefined
    , transformer: undefined
    })
  })

  t.test('description w/ input functions', async (t) => {
    const out = flagToPrompt('foobar', {
      type: String
    , description: 'hello world'
    , multi: true
    , choices: ['one']
    , when: () => {}
    , filter: () => {}
    , transformer: () => {}
    })

    t.match(out, {
      name: 'foobar'
    , type: 'checkbox'
    , message: 'foobar: hello world'
    , choices: ['one']
    , when: Function
    , filter: Function
    , transformer: Function
    })
  })
}).catch(threw)
