'use strict'
const seeli = require('seeli')

function sleep(ms = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = new seeli.Command({
  name: 'alerts'
, description: 'Displays a progress indicator'
, run: async function(cmd, data) {
    this.ui.start('rendering alerts')
    await sleep(1000)
    this.ui.info('info')
    await sleep(1000)
    this.ui.warn('warn')
    await sleep(1000)
    this.ui.fail('fail')
    await sleep(1000)
    this.ui.succeed('success')
  }
})
