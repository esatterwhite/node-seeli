'use strict'
const seeli = require('seeli')

function sleep(ms = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const messages = [
  'Adding Hidden Agendas'
, 'Adjusting Bell Curves'
, 'Aesthesizing Industrial Areas'
, 'Aligning Covariance Matrices'
, 'Applying Feng Shui Shaders'
, 'Applying Theatre Soda Layer'
, 'Asserting Packed Exemplars'
, 'Assembling Blockchain Reservoir'
, 'Attempting to Lock Back-Buffer'
, 'Binding Sapling Root System'
, 'Buffering Physical Caches'
, 'Building Data Trees'
, 'Bureacritizing Bureaucracies'
, 'Calculating Inverse Probability Matrices'
, 'Cohorting Exemplars'
, 'Collecting Meteor Particles'
]

const randomMessage = () => {
  return messages[Math.floor(Math.random() * messages.length)]
}

module.exports = new seeli.Command({
  name: 'messages'
, description: 'Displays random messages'
, run: async function(cmd, data) {
    let x = 10
    this.ui.start('processing...')
    while (x--) {
      await sleep(1000)
      this.ui.text = randomMessage()
    }
    this.ui.succeed('done')
  }
})
