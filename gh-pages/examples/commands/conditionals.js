'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'condition'
, description: 'Conditional flags'
, flags: {
    one: {
      type: String
    , description: 'first value'
    , default: null
    }
  , two: {
      type: String
    , description: 'second value'
    , default: null
    , when: (input) => {
        return !!input.one
      }
    }
  , three: {
      type: String
    , description: 'third value'
    , default: null
    , when: (input) => {
        return !!(input.one && input.two)
      }
    }
  , four: {
      type: String
    , description: 'fourth value'
    , default: null
    , when: (input) => {
        return !!(input.two)
      }
    }
  }
, run: async function(_, data) {
    console.dir(data)
  }
})
