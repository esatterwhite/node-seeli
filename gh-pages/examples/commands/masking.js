'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'mask'
, description: 'Input masking'
, flags: {
    password: {
      type: String
    , mask: true
    , description: 'user password'
    }
  , confirm: {
      type: String
    , mask: true
    , description: 'confirm password'
    }
  }
, run: async function(_, data) {
    if (data.confirm) {
      return data.password == data.confirm
        ? 'password confirmed'
        : 'passwords do not match'
    }
    return 'no password entered'
  }
})
