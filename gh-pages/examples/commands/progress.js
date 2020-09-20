'use strict'
const seeli = require('seeli')

function sleep(ms = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = new seeli.Command({
  name: 'progress'
, description: 'Displays a progress indicator'
, ui: 'bouncingBar'
, run: async function(cmd, data) {
    this.ui.start('processing...')
    await sleep(2000)
    this.ui.succeed('done')
  }
})
