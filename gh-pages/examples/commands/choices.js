'use strict'

const {Command, colorize} = require('seeli')

module.exports = new Command({
  name: 'choices'
, description: 'prompts for a specific value'
, flags: {
    direction: {
      type: String
    , required: true
    , description: 'The desired direction to travel'
    , choices: ['north', 'south', 'east', 'west']
    }
  }
, run: async function(_, data) {
    return `you selected ${colorize(data.direction)}!`
  }
})
