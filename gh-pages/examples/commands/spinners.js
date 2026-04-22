'use strict'
const seeli = require('seeli')
const spinners = require('cli-spinners')

function sleep(ms = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = new seeli.Command({
  name: 'spinners'
, description: 'Displays a progress indicator'
, ui: 'dots'
, run: async function(cmd, data) {
    this.ui.start('dots')
    for (const spinner of Object.keys(spinners)) {
      this.ui.text = spinner
      this.ui.spinner = spinner
      await sleep(2000)
    }
    this.ui.succeed('done')
  }
})
