'use strict'

const https = require('https')

const cli = require('../../')
const Command = cli.Command

const NAME = cli.get('name')

module.exports = new Command({
  description: 'Let people know how you really feel'
, name: 'fooas'
, usage: [
    `${cli.bold('Usage: ')} ${NAME} foaas bag --from=joe`
  ]
, flags: {
    from: {
      type: String
    , shorthand: 'f'
    , description: 'Who the message is from'
    , required: true
    }
  }
, run: (cmd, data) => {
    return new Promise((resolve, reject) => {
      const req = https.get({
        protocol:'https:'
      , hostname: 'foaas.com'
      , path: `/bag/${data.from}`
      , headers: {
          accept: 'application/json'
        , 'user-agent': 'seeli/v8.0.0'
        }
      }, (res) => {
        let out = ''
        res.on('data', (chunk) => {
          out += chunk
        })

        res.on('end', () => {
          const result = JSON.parse(out)
          resolve(`${result.message}\n${result.subtitle}`)
        })
      })
      req.on('error', reject)
      req.end()
    })
  }
})
