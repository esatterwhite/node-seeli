'use strict'

const {test, threw} = require('tap')
const Registry = require('../lib/registry')
const Command = require('../lib/command')

const one = new Command({
  name: 'one'
, description: 'this is command one'
, run: async () => {}
})

const two = new Command({
  name: 'two'
, alias: 'tow'
, description: 'this is command two'
, run: async () => {}
})

test('registry', async (t) => {

  t.test('#register (by command)', async (t) => {
    const registry = new Registry()
    registry.register(two)

    t.equal(registry.get('two'), two, 'registered property')
    t.deepEqual(registry.list(), ['two'], 'registered commands')
    t.equal(registry.get('tow'), two, 'registered alias')

  })

  t.test('#register (by name)', async (t) => {
    const registry = new Registry()
    registry.register('one', two)

    t.equal(registry.get('one'), two, 'registered property')
    t.deepEqual(registry.list(), ['one'], 'registered commands')
    t.equal(registry.get('tow'), two, 'registered alias')
  })

  t.test('#unregister (by name)', async (t) => {
    const registry = new Registry()
    registry.register('one', one)

    t.equal(registry.get('one'), one, 'registered property')
    registry.unregister(one.options.name)
    t.deepEqual(registry.list(), [], 'registered commands')
    t.notOk(registry.get('one'))
    t.doesNotThrow(() => {
      registry.unregister()
    })
  })

}).catch(threw)
