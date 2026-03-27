'use strict'

const test = require('tap').test
const invertWhen = require('../lib/command/invert-when')

function trueFn() {
  return true
}

function falseFn() {
  return false
}

async function asyncTrueFn() {
  return true
}

async function asyncFalseFn() {
  return false
}

function fnWithArgs(arg1, arg2) {
  return arg1 && arg2
}

async function asyncFnWithArgs(arg1, arg2) {
  return arg1 && arg2
}

test('invertWhen', async (t) => {
  t.test('should return undefined when fn is explicitly undefined or null', async (t) => {
    t.equal(invertWhen(undefined), undefined)
    t.equal(invertWhen(null), undefined)
  })

  t.test('should return a function that inverts boolean values', async (t) => {
    const invertedTrue = invertWhen(true)
    const invertedFalse = invertWhen(false)

    // The function should return a function that when called, returns the inverted value
    t.equal(invertedTrue(), false)
    t.equal(invertedFalse(), true)
  })

  t.test('should invert function results', async (t) => {
    const invertedTrue = invertWhen(trueFn)
    const invertedFalse = invertWhen(falseFn)

    t.equal(invertedTrue(), false)
    t.equal(invertedFalse(), true)
  })

  t.test('should invert async function results', async (t) => {
    const invertedAsyncTrue = invertWhen(asyncTrueFn)
    const invertedAsyncFalse = invertWhen(asyncFalseFn)

    t.equal(await invertedAsyncTrue(), false)
    t.equal(await invertedAsyncFalse(), true)
  })

  t.test('should handle function with arguments', async (t) => {
    const invertedFn = invertWhen(fnWithArgs)

    t.equal(invertedFn(true, true), false)
    t.equal(invertedFn(true, false), true)
    t.equal(invertedFn(false, false), true)
  })

  t.test('should handle async function with arguments', async (t) => {
    const invertedAsyncFn = invertWhen(asyncFnWithArgs)

    t.equal(await invertedAsyncFn(true, true), false)
    t.equal(await invertedAsyncFn(true, false), true)
    t.equal(await invertedAsyncFn(false, false), true)
  })
})

