'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'manual'
, description: 'Manual prompting'
, flags: {
    foo: {
      type: Boolean
    , description: 'Including more foo'
    }
  }
, run: async function(_, data) {
    if (data.foo) {
      var {bar} = await this.prompt({
        name: 'bar'
      , type: 'input'
      , message: 'include more bar'
      , validate: (value) => {
          if (!value) return 'bar is required'
          return true
        }
      })
    }
    return bar ? 'we need more bar' : 'we have no bar'
  }
})
