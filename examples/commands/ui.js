'use strict'

const toArray = require('mout/lang/toArray')
const cli = require('../../')
const spinners = require('cli-spinners')
module.exports = new cli.Command({
  description: 'Allows you to play with progress spinners and displays'
, name: 'ui'
, usage: [
    `${cli.bold('Usage:')}`
  , `  ${cli.get('name')} ui <${cli.colorize('options')}>`
  , `  ${cli.get('name')} ui --interactive`
  , `  ${cli.get('name')} ui --info=test --warn=foo --fail=bar --delay=2 --spinner=dots5`
  ]
, flags: {
    info: {
      type: [String, Array]
    , description: 'info messages to display'
    , required: false
    }
  , warn: {
      type: [String, Array]
    , description: 'warning messages to display'
    , required: false
    }
  , fail: {
      type: [String, Array]
    , description: 'failure messages to display'
    , required: false
    }
  , succeed: {
      type: [String, Array]
    , description: 'success messages to display'
    , required: false
    }
  , spinner: {
      'type': String
    , 'description': 'The spinner type to use'
    , 'required': false
    , 'default': 'dots7'
    , 'choices': Object.keys(spinners)
    }
  , delay: {
      'type': Number
    , 'description': 'time delay (sec) between messages'
    , 'default': 1
    }
  }
, run: async function(cmd, data) {
    this.ui.spinner = spinners[data.spinner]
    for (const word of toArray(data.info)) {
      this.ui.start('info...')
      await new Promise((resolve) => {
        setTimeout(() => {
          this.ui.info(word)
          resolve()
        }, data.delay * 1000)
      })
    }
    for (const word of toArray(data.warn)) {
      this.ui.start('warn...')
      await new Promise((resolve) => {
        setTimeout(() => {
          this.ui.warn(word)
          resolve()
        }, data.delay * 1000)
      })
    }
    for (const word of toArray(data.fail)) {
      this.ui.start('fail...')
      await new Promise((resolve) => {
        setTimeout(() => {
          this.ui.fail(word)
          resolve()
        }, data.delay * 1000)
      })
    }
    for (const word of toArray(data.succeed)) {
      this.ui.start('succeed...')
      await new Promise((resolve) => {
        setTimeout(() => {
          this.ui.succeed(word)
          resolve()
        }, data.delay * 1000)
      })
    }
  }
})
