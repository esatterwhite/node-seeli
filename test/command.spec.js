/* jshint laxcomma: true, smarttabs: true, node: true */
'use strict';

const fs       = require('fs');
const path     = require('path');
const os       = require('os');
const assert   = require('assert');
const strip    = require('strip-ansi');
const cli      = require('../')
const Command  = require('../lib/command');
const commands = require('../lib/commands')
const Help     = require('../lib/commands/help')
const usage    = require('../lib/usage')
const test     = require('tap').test

test('command', async (t) => {

  // description parsing
  t.test('~description', async (tt) => {
    tt.test('should accept a single string', async (ttt) => {
      let DescriptionCommand = new Command({
        description:"a test command"
      });
      ttt.equal('a test command', DescriptionCommand.description );

      DescriptionCommand.setOptions({
        description:"a different description"
      });

      ttt.equal("a different description", DescriptionCommand.description );
    });
  });

  t.test('nested flags', async (tt) => {
    const NestedCommand = new Command({
      flags: {
        test: {
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
    , onContent: () => {
        tt.pass('content also emitted')
      }
    , run: function( cmd, data ) {
        tt.match(data, {
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
        return 'done';
      }
    })

    tt.test('resolves nested values', (ttt) => {
      ttt.plan(1)
      NestedCommand.setOptions({
        args: ['', '--no-test', '--foo:bar:baz=12', '--nested:array=1', '--nested:array=2']
      })
      NestedCommand.once('content', () => {
        ttt.pass('content returned')
      })
      NestedCommand.run()
    })
  })

  // usage parsing
  t.test('~usage', async (tt) => {
    tt.test('should accept a single string', async (ttt) => {
      ttt.on('end', () => {
        commands.unregister('usage')
      })
      var UsageCommand = new Command({
        usage:"usage -a 'fake' --verbose"
      , args: ['--no-color']
      });

      const fixture_path = path.join(__dirname, 'fixtures', 'usage-sigular.fixture')
      const stdout = fs.readFileSync(fixture_path, 'utf8')
      ttt.equal(strip( UsageCommand.usage ).trim(), stdout.trim() );

      commands.register('usage', UsageCommand)
      Help.removeAllListeners()
      Help.reset()
      Help.setOptions({
        args: ['--no-color']
      })

      {
        const content = await Help.run('usage')
        ttt.equal(content.trim(), strip(UsageCommand.usage).trim());
      }

      {
        const content = await Help.run('help')
        ttt.match(content, /really/)
      }
    });

    tt.test('should accept an array of strings', async (ttt) => {
      const UsageCommand = new Command({
        usage:[
          "usage -a 'fake' --verbose",
          "usage -b 'test' --no-verbose",
        ]
      });

      const fixture_path = path.join(__dirname, 'fixtures', 'usage-array.fixture')
      const stdout = fs.readFileSync(fixture_path, 'utf8');
      ttt.equal(strip( UsageCommand.usage ), stdout);
    });
  });

  // internal argv parsing
  t.test('~argv', async (tt) => {
    tt.test('should accept an array of arguments', async (ttt) => {
      const ArgCommand = new Command({
        args:['--no-color']
      });
      ttt.strictEqual(ArgCommand.argv.color, false);
      ArgCommand.reset();

      ArgCommand.setOptions({
        args:['--color']
      });

      ttt.strictEqual(ArgCommand.argv.color, true);
    });

    tt.test('should understand unknown flags', async (ttt) => {
      const ArgCommand = new Command({
        args: ['--no-color', '--fake']
      });
      ttt.strictEqual(ArgCommand.argv.color, false);
      ttt.strictEqual(ArgCommand.argv.fake, true);
    });
  });

  // flag parsing
  t.test("~flags", async (tt) => {
    tt.test('should accept String Types', async (ttt) => {
      const StringCommand = new Command({
        flags: {
          string: {
            type: String
          }
        }
      , args: [ '--string=fake' ]
      });

      ttt.strictEqual(StringCommand.argv.string, 'fake');
    });

    tt.test('should reject input type miss matches', async (ttt) => {
      const NumberCommand = new Command({
        flags: {
          number: {
            type: Number
          }
        }
      });
      NumberCommand.reset()
      NumberCommand.setOptions({
        args: [ '--number=string' ]
      })
      tt.rejects(NumberCommand.run())
    });

    tt.test('should accept Boolean Types', async (ttt) => {
      const BooleanCommand = new Command({
        flags: {
          bool: {
            type: Boolean
          }
        }
      , args: [ '--bool' ]
      });

      ttt.strictEqual(BooleanCommand.argv.bool, true);
      BooleanCommand.reset();
      BooleanCommand.setOptions({
        args: ['--no-bool']
      });
      ttt.strictEqual(BooleanCommand.argv.bool, false );
    });

    tt.test('should accept Number Types', async (ttt) => {
      const NumberCommand = new Command({
        flags: {
          num: {
            type: Number
          }
        }
      , args: [ '--num=1' ]
      });

      ttt.strictEqual(NumberCommand.argv.num, 1);
    });



    tt.test('should accept multiple value flags', async (ttt) => {
      const MultiCommand = new Command({
        flags: {
          multi: {
            type: [Number, Array]
          }
        }
      , args: [ '--multi=1', '--multi=2', '--multi=3' ]
      });
      ttt.deepEqual(MultiCommand.argv.multi, [1, 2, 3]);
    });

    tt.test('should accept short hand flags', async (ttt) => {
      const Short = new Command({
        flags: {
          short: {
            type: String
          , shorthand: 's'
          }
        }
      , args: [ '-s', 'short' ]
      });
      ttt.strictEqual(Short.argv.short, 'short');
    });

    tt.test('should accept default values', async (ttt) => {
      const DefaultCommand = new Command({
        flags: {
          one: {
            type: Number
          , default: 1
          }

          ,two:{
            type: String
          , default: 'two'
          }
        }
      });

      ttt.equal(DefaultCommand.argv.one, 1);
      ttt.equal(DefaultCommand.argv.two, 'two');

      DefaultCommand.reset();

      DefaultCommand.setOptions({
        args:['--one=2']
      });

      ttt.equal(DefaultCommand.argv.one, 2);
    });

    tt.test('should throw an exception for required fields if not supplied', async (ttt) => {
      const RequiredCommand = new Command({
        flags: {
          one: {
            type: Number
          , required: true
          }
        }
      });

      ttt.rejects(RequiredCommand.run());
      RequiredCommand.reset();
      RequiredCommand.setOptions({
        args:['--one=1']
      });

      ttt.resolves(RequiredCommand.run(), 'should not thow');
    });

    tt.test('should throw execption when validation fails', async (ttt) =>  {
      const ValidationCommand = new Command({
        flags: {
          one: {
            type: Number
          , validate: () => {
              return false
            }
          }
        }
      });
      ValidationCommand.reset()
      ValidationCommand.setOptions({
        args: ['--one=1']
      })
      ttt.rejects(ValidationCommand.run());
    });
  });

  t.test('#run', async (tt) => {
    tt.test('should emit events for marked flags', async (ttt) => {
      const EventCommand = new Command({
        args: [ '--one', '--no-two']
      , flags: {
          one: {
            type: Boolean
          , event: true
          }
        , two:{
            type: Boolean
          , event: true
          }
        }
      , run: async (cmd, data) => {
          return (data.one && data.two );
        }
      });

      EventCommand.on('one', (value) => {
        ttt.equal(value, true);
      });

      EventCommand.on('two', (value) => {
        ttt.equal(value, false);
      });

      EventCommand.on('content', (value) => {
        ttt.equal(value, false);
      });
      EventCommand.run(null);
    });
  });

  t.test('Subclassing', async (tt) => {
    tt.test('should allow for subclassing', async (ttt) => {
      const defaults = {
        description:"This is a subclass"
      };

      class AltCommand extends Command {
        constructor(options){
          super( defaults, options );
        }
        fake( ){
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
      });
      cli.use('alt', Alt);
      ttt.notEqual(cli.list.indexOf( 'alt' ), -1);
      ttt.equal(Alt.fake(), false);
      ttt.equal(cli.commands.alt.fake(), false);
    });
  });

  t.test('Aliasing', async (tt) => {
    tt.test('from string',async (ttt) => {
      ttt.afterEach((cb) => {
        cli.commands.reset();
        cb()
      });

      const SingleAlias = new Command({
        alias: 'singel'
      , run: function(){}
      });

      cli.use('single', SingleAlias);

      ttt.ok(cli.commands.hasOwnProperty('single'))
      ttt.ok(cli.commands.hasOwnProperty('singe'))
      ttt.ok(cli.commands.hasOwnProperty('singel'))
    });

    tt.test('from Array',async (ttt) => {
      const SingleAlias = new Command({
        alias: ['singel', 'snigle']
      , run: function(){}
      });

      cli.use('single', SingleAlias);
      ttt.ok(cli.commands.hasOwnProperty('single'))
      ttt.ok(cli.commands.hasOwnProperty('sni'))
      ttt.ok(cli.commands.hasOwnProperty('snigle'))
      ttt.ok(cli.commands.hasOwnProperty('singel'))
    })
  })

  t.test('Directive parsing', async (tt) => {
    tt.test('should pass the first non-flag argument to run', async (ttt) => {
      const DirectiveCommand = new Command({
        flags: {
          test: {
            type: Boolean
          , default: true
          }
        }
      , run: async (cmd) => {
          assert.notStrictEqual( cmd, null );
          assert.equal(cmd, 'test');
        }
      });

      DirectiveCommand.setOptions({
        args:['test', '--test']
      });

      DirectiveCommand.run(null);
      DirectiveCommand.reset();
      ttt.rejects(
        // should throw because it is expecting test
        // sending fake should make its way to the run function
        DirectiveCommand.run('fake')
      );
    });
  });

  t.test('strict mode', (tt) => {
    tt.plan(1)
    const DirectiveCommand = new Command({
      strict: true
    , flags: {
        test: {
          type: Boolean
        , default: true
        }
      }
    , run: async (cmd, data) => {
        return ''
      }
    });

    DirectiveCommand.setOptions({
      args:['--fake=1']
    });
    DirectiveCommand.once('error', (err) => {
      tt.equal(err.code, 'ENOFLAG', 'should return an error')
    })
    DirectiveCommand.run();
  })
  t.end()
});
