'use strict'

const path = require('node:path')
const {execFile} = require('node:child_process')
const {promisify} = require('node:util')
const {test} = require('tap')

const exec = promisify(execFile)

test('typescript declarations support CommonJS and ESM consumers', async (t) => {
  const root = path.join(__dirname, '..')
  const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')
  const fixtures = path.join(__dirname, 'fixtures', 'typescript')

  const {stderr} = await exec(process.execPath, [
    tsc
  , '--noEmit'
  , '--strict'
  , '--skipLibCheck'
  , '--target'
  , 'ES2022'
  , '--module'
  , 'NodeNext'
  , '--moduleResolution'
  , 'NodeNext'
  , path.join(fixtures, 'cjs-consumer.cts')
  , path.join(fixtures, 'esm-consumer.mts')
  ], {cwd: root})

  t.equal(stderr, '', 'tsc should not emit diagnostics')
})
