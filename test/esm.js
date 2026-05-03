'use strict'

const {test} = require('tap')
const cjs = require('../')
const packageName = require('../package.json').name

test('esm entrypoint', async (t) => {
  const esm = await import(packageName)

  t.equal(esm.default, cjs, 'default export matches CommonJS entrypoint')
  t.equal(esm.commands, cjs, 'commands named export matches CommonJS entrypoint')
  t.equal(esm.Seeli, cjs.Seeli, 'exports Seeli')
  t.equal(esm.Command, cjs.Command, 'exports Command')
  t.same(esm.list, cjs.list, 'exports command list')
})

test('package exports keep CommonJS compatibility', async (t) => {
  t.equal(require(packageName), cjs, 'package require still resolves')
  t.equal(
    require(`${packageName}/lib/command`)
  , cjs.Command
  , 'deep command require still resolves'
  )
  t.equal(
    require(`${packageName}/lib/seeli`)
  , cjs.Seeli
  , 'deep seeli require still resolves'
  )
})
