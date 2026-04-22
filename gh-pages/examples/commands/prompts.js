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
    Object.assign(data, await this.prompt({
      type: 'input'
    , name: 'name'
    , message: 'What is your name'
    }))

    Object.assign(data, await this.prompt({
      type: 'password'
    , name: 'password'
    , message: 'What is your password'
    }))

    Object.assign(data, await this.prompt({
      type: 'confirm'
    , name: 'confirm'
    , message: 'Are you sure'
    }))

    if (!data.confirm) {
      Object.assign(data, await this.prompt({
        type: 'password'
      , name: 'password'
      , message: 'What is your password'
      }))
    }

    this.ui.start('processing...')
    await sleep(2000)
    this.ui.info(`name: ${data.name}`)
    this.ui.info(`password: ${data.password}`)
    this.ui.info(`confirmed: ${data.confirm}`)
  }
})
