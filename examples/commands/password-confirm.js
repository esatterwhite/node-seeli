'use strict'

const cli = require('../../')

module.exports = new cli.Command({
  description: 'Set your password'
, name: 'password'
, ui: 'bouncingBar'
, usage: `${cli.get('name')} password --interactive`
, flags: {
    password: {
      type: String
    , mask: true
    , description: 'unique password'
    , shorthand: 'p'
    , required: false
    }
  }
, run: async function(cmd, data) {
    if (data.password) {
      const response = await this.prompt({
        type: 'password'
      , name: 'confirm'
      , message: 'confirm password: '
      })

      if (response.confirm !== data.password) {
        return this.ui.fail('passwords do not match')
      }

      await new Promise((resolve, reject) => {
        this.ui.start('configuring password')
        setTimeout(() => {
          this.ui.succeed('your password was set')
          resolve(true)
        }, 3000)
      })
    }
  }
})
