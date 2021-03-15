'use strict'

const path = require('path')
const url = require('url')
const tap = require('tap')
const object = require('../lib/lang/object/')
const typeOf = require('../lib/usage/type-of')
const test = tap.test

test('object', async (t) => {
  t.test('#set', async (tt) => {
    const a = object.set({}, 'a:b:c:d', 1)
    tt.deepEqual(a, {
      a: {
        b: {
          c: {
            d: 1
          }
        }
      }
    })

    const b = object.set({}, 'a,b,c,d', 2, ',')
    tt.deepEqual(b, {
      a: {
        b: {
          c: {
            d: 2
          }
        }
      }
    })
  })

  t.test('#merge', async (t) => {
    const one = {a: {b: [1]}, c: path, d: url, x: {y: {z: 1}}}
    const two = {x: {y: {f: 3}}}
    const out = object.merge(one, two)
    t.deepEqual(out.c, path, 'path module intact')
    t.deepEqual(out.d, url, 'url module intact')
    t.deepEqual(out, {
      a: {b: [1]}
    , c: path
    , d: url
    , x: {y: {z: 1, f: 3}}
    })
  })
})

test('type-of', (t) => {
  function typeFn() {
    return String
  }

  function valueFn() {
    return 1
  }
  const cases = [
    [path, 'path', 'path']
  , [url, 'url', 'url']
  , [1, 'number', 'number']
  , ['1', 'string', 'string']
  , [true, 'boolean', 'true===boolean']
  , [[path], 'path*', '[path]']
  , [[url], 'url*', '[url]']
  , [[1], 'number*', '[number]']
  , [['1'], 'string*', '[string]']
  , [[true], 'boolean*', '[true]===boolean*']
  , [Number, 'number', 'Number Primitive']
  , [String, 'string', 'String Primitive']
  , [Boolean, 'boolean', 'Boolean Primitive']
  , [NaN, 'NaN', 'NaN']
  , [typeFn, 'string', 'function Primitive']
  , [valueFn, 'number', 'function value']
  , [[typeFn], 'string*', '[function primitive] === string*']
  , [[valueFn], 'number*', '[function value] === number*']
  ]
  for (const item of cases) {
    const actual = typeOf(item[0])
    const expected = item[1]
    t.equal(actual, expected, item[2])
  }
  t.end()
})
