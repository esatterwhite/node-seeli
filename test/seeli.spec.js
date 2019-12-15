'use strict'
const os = require('os')
const {test} = require('tap')
const cli = require('../')

test('cli', async (t) => {
  t.test('#run', function(tt) {
    const help = cli.commands.get('help')
    help.once('content', (data) => {
      if (/usage/i.test(data)) {
        const expected = [
          'Usage:  runner <command> [options]'
        , ''
        , 'Where <command> is the name the command to execute'
        , '*  help - Displays information about available commands'
        ].join(os.EOL)
        tt.equal(data, expected)
        tt.end()
      }
    })

    help.setOptions({
      args: ['--no-color']
    })

    cli.set({
      exitOnContent: false
    , name: 'runner'
    })
    cli.run()
  })

  t.test('color functions', async (tt) => {
    const colors = [
      'red', 'blue', 'green'
    , 'yellow', 'bold', 'grey'
    , 'dim', 'black', 'magenta'
    , 'cyan', 'redBright', 'blueBright'
    , 'greenBright', 'yellowBright', 'cyanBright'
    ]

    for (const color of colors) {
      tt.type(cli[color], Function, `${color} should be a top level function`)
    }
  })

  t.test('conf', async (tt) => {
    tt.test('should store default values', async (ttt) => {
      ttt.ok(cli.get('name'))
      ttt.ok(cli.get('color'))
      ttt.ok(cli.get('help'))
    })

    tt.test('should allow arbitrary values', async (ttt) => {
      cli.set('test', 1)
      ttt.equal(cli.get('test'), 1)
    })

    tt.test('should allow setting multiple values', async (ttt) => {
      cli.set({
        a: 1
      , b: 2
      , c: 3
      })

      ttt.equal(cli.get('a'), 1, 'a===1')
      ttt.equal(cli.get('b'), 2, 'b===2')
      ttt.equal(cli.get('c'), 3, 'c===3')
    })
  })

  t.test('#use', async (tt) => {
    tt.on('end', () => {
      cli.reset()
    })
    const TestCommand = new cli.Command()

    tt.test('should allow commands to be registered by name', async (ttt) => {
      cli.use('test', TestCommand)
      ttt.notEqual(cli.list.indexOf('test'), -1)
    })

    tt.test('#list', async (ttt) => {
      ttt.test('should return an array', async (tttt) => {
        tttt.ok(Array.isArray(cli.list))
      })

      ttt.test('should only list top level commands', async (tttt) => {
        tttt.notEqual(cli.list.indexOf('test'), -1)
        tttt.notEqual(cli.list.indexOf('help'), -1)
        tttt.equal(cli.list.indexOf('h'), -1)
        tttt.equal(cli.list.indexOf('he'), -1)
        tttt.equal(cli.list.indexOf('hel'), -1)
      })
    })
  })

  t.test('command errors bubble up', async (t) => {
    const runner = new cli.Seeli()
    const cmd = new cli.Command({
      name: 'foobar'
    , description: 'foobar'
    , async run() {
        const error = new Error('broke')
        error.code = 'EBROKE'
        throw error
      }
    })

    runner.use(cmd)
    runner.setOptions({
      args: ['foobar']
    })

    t.notOk(process.exitCode, 'exitCode not set')
    await runner.run()
    t.equal(process.exitCode, 1, 'exitCode set to 1')
    process.exitCode = undefined
  })

  t.test('unknown command sets exit code', async (t) => {
    const runner = new cli.Seeli()
    runner.setOptions({
      args: ['foobar']
    })

    t.notOk(process.exitCode, 'exitCode not set')
    await runner.run()
    t.equal(process.exitCode, 1, 'exitCode set to 1')
    process.exitCode = undefined
  })

})
