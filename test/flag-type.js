'use strict'

const path = require('path')
const url = require('url')
const {test, threw} = require('tap')
const flagType = require('../lib/command/flag-type')

test('flagType', async (t) => {

  const cases = [
    [{type: Boolean}, 'confirm', 'Boolean === confirm']
  , [{type: Number}, 'number', 'Number === number']
  , [{type: String}, 'input', 'String === input']
  , [{type: path}, 'input', 'path === input']
  , [{type: url}, 'input', 'url === input']
  , [{type: [Number, Array]}, 'number', '[Number, Array] === number']
  , [{type: String, mask: true}, 'password', 'mask=true === password']
  , [{type: String, choices: []}, 'list', 'choices === list']
  , [{type: String, choices: [], multi: true}, 'checkbox', 'choices + multi === checkbox']
  , [{type: Function}, 'input', 'unexpected type === input']
  ]

  for (const [flag, expected, msg] of cases) {
    const actual = flagType(flag)
    t.equal(actual, expected, msg)
  }
}).catch(threw)
