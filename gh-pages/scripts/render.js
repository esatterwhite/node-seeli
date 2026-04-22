#!/usr/bin/env node
'use strict'

const {promises: fs} = require('fs')
const path = require('path')
const execa = require('execa')

const ROOT = path.join(__dirname, '../')
const ASSET_DIR = path.join(ROOT, 'assets')
const RECORDING_DIR = path.join(ASSET_DIR, 'recordings')
const OUTPUT_DIR = path.join(ASSET_DIR, 'img', 'guides')


;(async () => {

  try {
    await fs.mkdir(OUTPUT_DIR)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }

  const file = process.argv[2]
  if (file) {
    await render(path.join(ROOT, file))
    return
  }

  for await (const file of readdirp(RECORDING_DIR)) {
    await render(file)
  }
})()

async function render(file, location) {
  const relative_path = path.relative(RECORDING_DIR, file)
  const parsed_path = path.parse(relative_path)
  const render_to = path.join(OUTPUT_DIR, parsed_path.dir, `${parsed_path.name}.gif`)

  if (parsed_path.dir) {
    try {
      await fs.mkdir(parsed_path.dir)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }

  console.log(relative_path, '-->', render_to)
  const stream = execa('npm', ['run', 'terminalizer', 'render', file, '--', '-o', render_to])
  stream.stdout.pipe(process.stdout)
  await stream
}

async function* readdirp(dir) {
  const results = await fs.readdir(dir, {
    withFileTypes: true
  })

  for (const item of results) {
    const fp = path.join(dir, item.name)
    if (item.isFile()) {
      yield fp
      continue
    }

    if (item.isDirectory()) {
      yield * readdirp(fp)
      continue
    }
  }
}
