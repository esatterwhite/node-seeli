'use strict'

const cli = require('../../../')

module.exports = new cli.Command({
  name: 'bub'
, description: 'sub bub'
, flags: {
    ask: {
      type: Boolean
    , required: true
    , description: 'do you like bub'
    }
  }
, async run(cmd, data) {
    return 'bub'
  }
})
