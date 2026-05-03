'use strict'

const {test} = require('tap')
const cjs = require('../')
const packageName = require('../package.json').name

test('esm entrypoint', async (t) => {
  const esm = await import(packageName)

  t.equal(esm.default, cjs, 'default export matches CommonJS entrypoint')
  t.equal(esm.default.Seeli, cjs.Seeli, 'default export exposes Seeli')
  t.equal(esm.default.Command, cjs.Command, 'default export exposes Command')
  t.same(esm.default.list, cjs.list, 'default export exposes command list')
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
