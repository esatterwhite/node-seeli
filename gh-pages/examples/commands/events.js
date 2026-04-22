'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'events'
, description: 'examples of command event handlers'
, onInfo: function(msg) {
    this.ui.info(msg)
  }
, onFail: function(msg) {
    this.ui.fail(msg)
  }
, onContent: function(content) {
    if (!content) return
    this.ui.warn(content.message)
    this.ui.succeed('complete')
  }
, run: async function(command, data) {
    this.emit('info', 'hello')
    this.emit('fail', 'world')
    return {message: 'hello world'}
  }
})

