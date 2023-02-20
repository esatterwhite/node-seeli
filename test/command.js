'use strict'

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const strip = require('strip-ansi')
const cli = require('../')
const Command = require('../lib/command')
const commands = require('../lib/commands')
const Help = require('../lib/commands/help')
const test = require('tap').test

test('command', async (t) => {

  // description parsing
  t.test('~description', async (t) => {
    t.test('should accept a single string', async (t) => {
      const DescriptionCommand = new Command({
        description: 'a test command'
      })
      t.equal('a test command', DescriptionCommand.description)

      DescriptionCommand.setOptions({
        description: 'a different description'
      })

      t.equal('a different description', DescriptionCommand.description)
    })
  })

  t.test('duplicate shorthands', async (t) => {
    t.throws(() => {
      return new Command({
        flags: {
          foo: {
            type: String
          , description: 'this is foo'
          , shorthand: 'f'
          }
        , bar: {
            type: String
          , description: 'this is bar'
          , shorthand: 'f'
          }
        }
      })
    }, {code: 'ESHORTHAND', name: 'DuplicateShorthandException'})
  })

  t.test('nested flags', async (t) => {
    t.plan(3)
    const NestedCommand = new Command({
      flags: {
        'test': {
          type: Boolean
        , required: true
        }
      , 'foo:bar:baz': {
          type: Number
        , required: true
        }
      , 'nested:array': {
          type: [Number, Array]
        , required: true
        }
      }
    , onContent: (content) => {
        t.equal(content, 'done', 'content also emitted')
      }
    , run: async function(cmd, data) {
        t.match(data, {
          foo: {
            bar: {
              baz: Number
            }
          }
        , test: Boolean
        , nested: {
            array: [1, 2]
          }
        })
        return 'done'
      }
    })

    NestedCommand.setOptions({
      args: ['', '--no-test', '--foo:bar:baz=12', '--nested:array=1', '--nested:array=2']
    })
    NestedCommand.once('content', (content) => {
      t.equal(content, 'done', 'content returned')
    })
    await NestedCommand.run()
  })

  // usage parsing
  t.test('~usage', async (t) => {
    t.test('should accept a single string', async (t) => {
      t.on('end', () => {
        cli.config('color', 'green')
      })

      cli.config('color', 'invalid')
      const UsageCommand = new Command({
        usage: "usage -a 'fake' --verbose"
      , args: ['--no-color']
      })

      const fixture_path = path.join(__dirname, 'fixtures', 'usage-sigular.fixture')
      const stdout = fs.readFileSync(fixture_path, 'utf8')
      t.equal(strip(UsageCommand.usage).trim(), stdout.trim())

      commands.register('usage', UsageCommand)
      Help.removeAllListeners()
      Help.reset()
      Help.setOptions({
        args: ['--no-color']
      })

      {
        const content = await Help.run('usage')
        t.equal(content.trim(), strip(UsageCommand.usage).trim())
      }

      {
        const content = await Help.run('help')
        t.match(content, /displays information/ig)
      }
      commands.unregister('usage')
    })

    t.test('should accept an array of strings', async (t) => {
      const UsageCommand = new Command({
        usage: [
          "usage -a 'fake' --verbose"
        , "usage -b 'test' --no-verbose"
        ]
      })

      const fixture_path = path.join(__dirname, 'fixtures', 'usage-array.fixture')
      const stdout = fs.readFileSync(fixture_path, 'utf8')
      t.equal(strip(UsageCommand.usage), stdout)
    })

    t.test('handles missing subcommands', async (t) => {
      const a = new Command({
        name: 'a'
      , usage: ['get a']
      , run: async function() {
          return null
        }
      })

      const b = new Command({
        name: 'b'
      , usage: ['get b']
      , run: async function() {
          return null
        }
      })

      const CmdA = new Command({
        name: 'get'
      , usage: [
          ...a.options.usage
        , ...b.options.usage
        ]
      , commands: [a, b]
      , run: async function(cmd, flags) {
          if (cmd && !this.has(cmd)) {
            const error = new Error(`unknown waves action ${cmd}`)
            error.code = 'ENOCOMMAND'
            throw error
          }

          const help = cli.get('help')
          return help.run(flags.argv.remain)
        }
      })

      commands.register(CmdA)
      t.on('end', () => {
        commands.unregister('get')
      })
      Help.removeAllListeners()
      Help.reset()
      Help.setOptions({
        args: ['--no-color', 'get', 'c']
      })

      {
        const content = await Help.run()
        t.match(content.trim(), /Invalid command:/)
        t.match(content, /\$ command get c/)
      }
    })
  })

  // internal argv parsing
  t.test('~argv', async (tt) => {
    test('should accept an array of arguments', async (t) => {
      const ArgCommand = new Command({
        args: ['--no-color']
      })
      t.strictEqual(ArgCommand.argv.color, false)
      ArgCommand.reset()

      ArgCommand.setOptions({
        args: ['--color']
      })

      t.strictEqual(ArgCommand.argv.color, true)
    })

    test('should understand unknown flags', async (t) => {
      const ArgCommand = new Command({
        args: ['--no-color', '--fake']
      })
      t.strictEqual(ArgCommand.argv.color, false)
      t.strictEqual(ArgCommand.argv.fake, true)
    })
  })

  // flag parsing
  t.test('~flags', async (t) => {
    t.test('should accept String Types', async (t) => {
      const StringCommand = new Command({
        flags: {
          string: {
            type: String
          }
        }
      , args: ['--string=fake']
      })

      t.strictEqual(StringCommand.argv.string, 'fake')
    })

    t.test('should reject input type miss matches', async (t) => {
      const NumberCommand = new Command({
        flags: {
          number: {
            type: Number
          }
        }
      })
      NumberCommand.reset()
      NumberCommand.setOptions({
        args: ['--number=string']
      })
      t.rejects(NumberCommand.run())
    })

    t.test('should accept Boolean Types', async (t) => {
      const BooleanCommand = new Command({
        flags: {
          bool: {
            type: Boolean
          }
        }
      , args: ['--bool']
      })

      t.strictEqual(BooleanCommand.argv.bool, true)
      BooleanCommand.reset()
      BooleanCommand.setOptions({
        args: ['--no-bool']
      })
      t.strictEqual(BooleanCommand.argv.bool, false)
    })

    t.test('should accept Number Types', async (t) => {
      const NumberCommand = new Command({
        flags: {
          num: {
            type: Number
          }
        }
      , args: ['--num=1']
      })

      t.strictEqual(NumberCommand.argv.num, 1)
    })



    t.test('should accept multiple value flags', async (t) => {
      const MultiCommand = new Command({
        flags: {
          multi: {
            type: [Number, Array]
          }
        }
      , args: ['--multi=1', '--multi=2', '--multi=3']
      })
      t.deepEqual(MultiCommand.argv.multi, [1, 2, 3])
    })

    t.test('should accept short hand flags', async (t) => {
      const Short = new Command({
        flags: {
          'short': {
            type: String
          , shorthand: 's'
          }
        }
      , args: ['-s', 'short']
      })
      t.strictEqual(Short.argv.short, 'short')
    })

    t.test('should accept default values', async (t) => {
      const DefaultCommand = new Command({
        flags: {
          one: {
            'type': Number
          , 'default': 1
          }

        , two: {
            'type': String
          , 'default': 'two'
          }
        }
      })

      t.equal(DefaultCommand.argv.one, 1)
      t.equal(DefaultCommand.argv.two, 'two')

      DefaultCommand.reset()

      DefaultCommand.setOptions({
        args: ['--one=2']
      })

      t.equal(DefaultCommand.argv.one, 2)
    })

    t.test('should throw an exception for required fields if not supplied', async (t) => {
      const RequiredCommand = new Command({
        flags: {
          one: {
            type: Number
          , required: true
          }
        }
      })

      t.rejects(RequiredCommand.run())
      RequiredCommand.reset()
      RequiredCommand.setOptions({
        args: ['--one=1']
      })

      t.resolves(RequiredCommand.run(), 'should not thow')
    })

    test('should throw execption when validation fails', async (t) => {
      const ValidationCommand = new Command({
        flags: {
          one: {
            type: Number
          , validate: () => {
              return false
            }
          }
        }
      })
      ValidationCommand.reset()
      ValidationCommand.setOptions({
        args: ['--one=1']
      })
      t.rejects(ValidationCommand.run())
    })
  })

  t.test('#run', async (tt) => {
    test('should emit events for marked flags', (t) => {
      t.plan(3)
      const EventCommand = new Command({
        args: ['--one', '--no-two']
      , flags: {
          one: {
            type: Boolean
          , event: true
          }
        , two: {
            type: Boolean
          , event: true
          }
        }
      , run: async (cmd, data) => {
          return (data.one && data.two)
        }
      })

      EventCommand.on('one', (value) => {
        t.equal(value, true)
      })

      EventCommand.on('two', (value) => {
        t.equal(value, false)
      })

      EventCommand.on('content', (value) => {
        t.equal(value, false)
      })
      EventCommand.run(null)
    })
  })

  t.test('Command static run function', async (t) => {
    async function run() {
      return 'static call'
    }
    class StaticCommand extends Command {
      constructor(opts = {}) {
        super(opts, {run})
      }
    }

    const out = await StaticCommand.run()
    t.equal(out, 'static call', 'static run function output')
  })

  t.test('Subclassing', async (tt) => {
    test('should allow for subclassing', async (t) => {
      const defaults = {
        description: 'This is a subclass'
      }

      class AltCommand extends Command {
        constructor(options) {
          super(defaults, options)
        }
        fake() {
          return false
        }
      }

      const Alt = new AltCommand({
        flags: {
          test: {
            type: Boolean
          , event: false
          }
        }
      })
      cli.use('alt', Alt)
      t.notEqual(cli.list.indexOf('alt'), -1)
      t.equal(Alt.fake(), false)
      t.equal(cli.get('alt').fake(), false)
    })
  })

  t.test('Aliasing', async (tt) => {
    test('from string', async (t) => {
      t.afterEach((cb) => {
        cli.reset()
        cb()
      })

      const SingleAlias = new Command({
        alias: 'singel'
      , run: function() {}
      })

      cli.use('single', SingleAlias)

      t.ok(cli.has('single'))
      t.ok(cli.has('singe'))
      t.ok(cli.has('singel'))
    })

    test('from Array', async (t) => {
      const SingleAlias = new Command({
        alias: ['singel', 'snigle']
      , run: function() {}
      })

      cli.use('single', SingleAlias)
      t.ok(cli.has('single'))
      t.ok(cli.has('sni'))
      t.ok(cli.has('snigle'))
      t.ok(cli.has('singel'))
    })
  })

  t.test('Directive parsing', async (tt) => {
    test('should pass the first non-flag argument to run', async (t) => {
      const DirectiveCommand = new Command({
        flags: {
          test: {
            'type': Boolean
          , 'default': true
          }
        }
      , run: async (cmd) => {
          if (cmd) {
            assert.equal(cmd, 'test')
          }
        }
      })

      DirectiveCommand.setOptions({
        args: ['test', '--test']
      })

      await DirectiveCommand.run(null)
      DirectiveCommand.reset()
      t.rejects(
        // should throw because it is expecting test
        // sending fake should make its way to the run function
        DirectiveCommand.run('fake')
      )
    })
  })

  t.test('strict mode', (t) => {
    t.plan(1)
    const DirectiveCommand = new Command({
      strict: true
    , flags: {
        test: {
          'type': Boolean
        , 'default': true
        }
      }
    , run: async (cmd, data) => {
        return ''
      }
    })

    DirectiveCommand.setOptions({
      args: ['--fake=1']
    })

    DirectiveCommand.once('error', (err) => {
      t.equal(err.code, 'ENOFLAG', 'should return an error')
    })

    DirectiveCommand.run()
  })

  t.test('manual prompt', async (t) => {
    const cmd = new Command({
      run: async function() {
        const promise = this.prompt({
          type: 'input'
        , name: 'option'
        , message: 'do you want this option'
        })

        promise.ui.rl.emit('line', 'yes')
        return promise
      }
    })

    const output = await cmd.run()
    t.match(output, {option: 'yes'})
  })

  t.test('non-interactive errors on interactive', async (t) => {
    const cmd = new Command({
      interactive: false
    , run: async function() {
        t.fail('run function should not be called')
      }
    })
    cmd.setOptions({args: ['--interactive']})
    await t.rejects(cmd.run(), {code: 'ECOMMAND'})
  })

  t.test('interactive command', async (t) => {
    const cmd = new Command({
      interactive: true
    , strict: true
    , args: ['--interactive']
    , flags: {
        fake: {
          type: [String, Array]
        , required: true
        , description: 'is this fake'
        , choices: ['yes', 'no']
        }
      }
    , run: async function(_, data) {
        return data
      }
    })

    cmd.ask = async () => {
      return ['yes']
    }

    const answers = await cmd.run()
    t.match(answers, {
      fake: ['yes']
    })
  })

  t.test('interactive command', async (t) => {
    const cmd = new Command({
      interactive: true
    , strict: true
    , args: ['--interactive']
    , flags: {
        fake: {
          type: String
        , required: true
        , description: 'is this fake'
        }
      }
    , run: async function(_, data) {
        return data
      }
    })

    const prompt = cmd.prompt

    cmd.prompt = function(arg) {
      const promise = prompt.call(cmd, arg)
      promise.ui.activePrompt.done('yes')
      promise.ui.activePrompt.close()
      return promise
    }

    const answers = await cmd.run()
    t.match(answers, {
      fake: 'yes'
    })
  })

  t.test('command#toPrompt', async (t) => {
    const cmd = new Command({
      flags: {
        one: {
          type: Boolean
        , description: 'boolean flag'
        , when: () => {
            return true
          }
        }
      , two: {
          type: [Number, Array]
        , filter: (val) => {
            return val
          }
        }
      }
    })

    const out = cmd.toPrompt()
    t.ok(Array.isArray(out), 'output is an array')
    t.equal(out.length, 2, 'expected prompt count')

    t.match(out, [{
      type: 'confirm'
    , message: 'one: boolean flag'
    , when: Function
    , validate: undefined
    , filter: undefined
    }, {
      type: 'number'
    , message: /no description/ig
    , when: undefined
    , validate: undefined
    , filter: Function
    }])
  })

  t.test('sub command execution', async (t) => {
    const bub = new Command({
      name: 'bub'
    , async run() {
        return 'bub'
      }
    })

    const hub = new Command({
      name: 'hub'
    , commands: [bub]
    , async run() {
        return 'hub'
      }
    })

    const cmd = new Command({
      name: 'cmd'
    , commands: [hub]
    , async run() {
        return 'cmd'
      }
    })

    t.ok(cmd.get('hub'), 'hub sub command')
    t.ok(cmd.get('hub').get('bub'), 'hub bub sub command')

    t.test('execute level 1 sub command', async (t) => {
      t.teardown(() => {
        cmd.reset()
      })

      cmd.setOptions({
        args: ['cmd', 'hub']
      })

      const output = await cmd.run()
      t.equal(output, 'hub', 'hub command executed')
    })

    t.test('execute level 2 sub command', async (t) => {
      cmd.setOptions({
        args: ['cmd', 'hub', 'bub']
      })

      const hub = cmd.get('hub')
      const bub = hub.get('bub')
      const output = await bub.run()
      t.equal(output, 'bub', 'bub command executed')
    })
  })

  t.test('command serialize', async (t) => {
    const base_flags = [
      '--interactive'
    , '--no-interactive'
    , '--color'
    , '--no-color'
    ]
    const cmd = new Command({
      name: 'root'
    , commands: [
        new Command({
          name: 'one'
        , flags: {
            option: {
              type: [String, Array]
            , choices: ['one', 'two']
            }
          , single: {
              type: Number
            , choices: [1, 4]
            }
          }
        })
      , new Command({
          name: 'two'
        , commands: [
            new Command({
              name: 'three'
            })
          ]
        })
      ]
    })

    t.deepEqual(cmd.tree, {
      '-': base_flags
    , '--': base_flags
    , 'two': {
        'three': base_flags
      , '-': base_flags
      , '--': base_flags
      }
    , 'one': [...base_flags, '--option', '--single']
    }, 'serialized command tree')
  })

  t.test('choice validation', async (t) => {
    const cmd = new Command({
      interactive: false
    , strict: false
    , flags: {
        option: {
          type: [String, Array]
        , choices: ['one', 'two']
        }
      , single: {
          type: Number
        , choices: [1, 4]
        }
      }
    , run: async () => {
        return true
      }
    })

    t.afterEach(async () => {
      cmd.reset()
    })

    t.test('valid options (no input)', async (t) => {
      t.resolves(cmd.run(), 'valid options pass validation')
    })

    t.test('valid options', async (t) => {
      cmd.setOptions({
        args: ['--option=one', '--option=two']
      })
      t.resolves(cmd.run(), 'valid options pass validation')
    })

    t.test('valid options (numeric input)', async (t) => {
      cmd.setOptions({
        args: ['--single=1']
      })
      t.resolves(cmd.run(), 'valid options pass validation')
    })

    t.test('invalid options', async (t) => {
      cmd.setOptions({
        args: ['--option=one', '--option=three']
      })
      t.rejects(cmd.run(), {
        code: 'EINVALIDCHOICE'
      }, 'EINVALIDCHOICE error raised')
    })
  })
})
