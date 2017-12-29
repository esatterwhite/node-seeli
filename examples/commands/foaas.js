'use strict'

const https = require('https')

const cli = require('../../')
const Command = cli.Command

const NAME = cli.get('name')
const color = cli[cli.get('color')]

const subcommands = new Set([
  'awesome'
, 'bag'
, 'because'
, 'bucket'
, 'bye'
, 'cool'
, 'cup'
, 'no'
])

module.exports = new Command({
  description: 'Let people know how you really feel'
, name: 'fooas'
, usage: [
    `${cli.bold('Usage: ')} ${NAME} foaas <${color('subcommand')}> --from=joe`
  , `${cli.bold('Usage: ')} ${NAME} foaas ${color('awesome')} --from=bill`
  , `${cli.bold('Usage: ')} ${NAME} foaas ${color('cup')} --from=bill`
  , ''
  , `${cli.bold('Subcommands')}:`
  ].concat(Array.from(subcommands).map(cmd => `  * ${color(cmd)}`))
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
      if (!subcommands.has(cmd)) {
        const err = new Error(`Invalid subcommand ${cmd}`)
        err.code = 'ESUBCOMMAND'
        return reject(err)
      }
      const req = https.get({
        protocol:'https:'
      , hostname: 'foaas.com'
      , path: `/${cmd}/${data.from}`
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
