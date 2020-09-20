'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'complex'
, description: 'renders complex objects'
, onContent: function(content) {
    if (!content) return
    this.ui.info(content.message)
    this.ui.succeed('complete')
  }
, run: async function(command, data) {
    return {message: 'hello world'}
  }
})
