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

  t.test('#register (by command)', async (tt) => {
    const registry = new Registry()
    registry.register(two)

    tt.equal(registry.two, two, 'registered property')
    tt.deepEqual(registry.list(), ['two'], 'registered commands')
    tt.equal(registry.tow, two, 'registered alias')

    registry.tow = one
    tt.equal(registry.two, one, 'command reassigned by alias')
  })

  t.test('#register (by name)', async (tt) => {
    const registry = new Registry()
    registry.register('one', two)

    tt.equal(registry.one, two, 'registered property')
    tt.deepEqual(registry.list(), ['one'], 'registered commands')
    tt.equal(registry.tow, two, 'registered alias')
  })


  t.test('#unregister (by name)', async (tt) => {
    const registry = new Registry()
    registry.register('one', one)

    tt.equal(registry.one, one, 'registered property')
    registry.unregister(one.options.name)
    tt.deepEqual(registry.list(), [], 'registered commands')
    tt.notOk(registry.one)
    tt.doesNotThrow(() => {
      registry.unregister()
    })
  })

}).catch(threw)
