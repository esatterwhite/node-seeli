/* jshint laxcomma: true, smarttabs: true, node: true */
'use strict';
const assert   = require('assert');
const cli      = require('../')
const Command  = require('../lib/command');
const commands = require('../lib/commands')
const Help     = require('../lib/commands/help')
const strip    = require('strip-ansi');
const os       = require('os');
const domain   = require('../lib/domain')
const test     = require('tap').test

test('command', function(t){

  // description parsing
  t.test('~description', function(tt){
    tt.test('should accept a single string', function(ttt){
      let DescriptionCommand = new Command({
        description:"a test command"
      });
      ttt.equal('a test command', DescriptionCommand.description );

      DescriptionCommand.setOptions({
        description:"a different description"
      });

      ttt.equal("a different description", DescriptionCommand.description );
      ttt.end()
    });
    tt.end()
  });

  t.test('nested flags', (tt) => {
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
    tt.end()
  })

  // usage parsing
  t.test('~usage', function(tt){
    tt.test('should accept a single string', function(ttt){
      ttt.on('end', () => {
        commands.unregister('usage')
      })
      var UsageCommand = new Command({
        usage:"usage -a 'fake' --verbose"
      , args: ['--no-color']
      });

      var out = [
        "usage -a 'fake' --verbose",
        "",
        "Options:",
        "",
        "  " + "-i, --interactive, --no-interactive <boolean> [false] Use the interactive propmts",
        "  --color, --no-color <boolean> [true] Enable ANSI color in output",
        "  ",
                "  <...>: input type | *: repeatable flags | [...]: default values"
      ].join(os.EOL );

      ttt.equal(out.trim(), strip( UsageCommand.usage ).trim() );

      commands.register('usage', UsageCommand)
      Help.removeAllListeners()
      Help.reset()
      Help.setOptions({
        args: ['--no-color']
      })
      Help.run('usage')
      .then((content) => {
        ttt.equal(content.trim(), strip(UsageCommand.usage).trim());
      })
      .catch(ttt.error)

      Help.run('help')
      .then((content) => {
        ttt.match(content, /really/)
        ttt.end()
      })
      .catch(ttt.error)
    });

    tt.test('should accept an array of strings', function(ttt){
      var UsageCommand = new Command({
        usage:[
          "usage -a 'fake' --verbose",
          "usage -b 'tesk' --no-verbose",
        ]
      });

      var out = [
        "usage -a 'fake' --verbose",
        "usage -b 'tesk' --no-verbose",
        "",
        "Options:",
        "",
        "  " + "-i, --interactive, --no-interactive <boolean> [false] Use the interactive propmts",
        "  --color, --no-color <boolean> [true] Enable ANSI color in output",
        "  ",
                "  <...>: input type | *: repeatable flags | [...]: default values"
      ].join(os.EOL );
      ttt.equal( out, strip( UsageCommand.usage ) );
      ttt.end()
    });
    tt.end()
  });

  // internal argv parsing
  t.test('~argv', function(tt){
    tt.test('should accept an array of arguments', function(ttt){
      var ArgCommand = new Command({
        args:['--no-color']
      });
      ttt.strictEqual( false, ArgCommand.argv.color);
      ArgCommand.reset();

      ArgCommand.setOptions({
        args:['--color']
      });

      ttt.strictEqual( true, ArgCommand.argv.color);
      ttt.end()
    });

    tt.test('should understand unknown flags', function(ttt){
      var ArgCommand = new Command({
        args:['--no-color', '--fake']
      });
      ttt.strictEqual( false, ArgCommand.argv.color);
      ttt.strictEqual( true, ArgCommand.argv.fake);
      ttt.end()
    });
    tt.end()
  });

  // flag parsing
  t.test("~flags", function(tt){
    tt.test('should accept String Types', function(ttt){
      var StringCommand = new Command({
        flags:{
          string:{
            type:String
          }
        }
        ,args:[ '--string=fake' ]
      });

      ttt.strictEqual( 'fake', StringCommand.argv.string );
      ttt.end()
    });

    tt.test('should reject input type miss matches', function(ttt){
      var NumberCommand = new Command({
        flags:{
          number:{
            type: Number
          }
        }
      });
      domain.remove( NumberCommand );
      NumberCommand.reset()
      NumberCommand.setOptions({
        args: [ '--number=string' ]
      })
      tt.rejects(NumberCommand.run())
      ttt.end()
    });

    tt.test('should accept Boolean Types', function(ttt){
      var BooleanCommand = new Command({
        flags:{
          bool:{
            type:Boolean
          }
        }
        ,args:[ '--bool' ]
      });

      ttt.strictEqual( true, BooleanCommand.argv.bool );
      BooleanCommand.reset();
      BooleanCommand.setOptions({
        args:['--no-bool']
      });
      ttt.strictEqual( false, BooleanCommand.argv.bool );
      ttt.end()
    });

    tt.test('should accept Number Types', function(ttt){
      var NumberCommand = new Command({
        flags:{
          num:{
            type:Number
          }
        }
        ,args:[ '--num=1' ]
      });

      ttt.strictEqual( 1, NumberCommand.argv.num );
      ttt.end()
    });



    tt.test('should accept multiple value flags', function(ttt){
      var MultiCommand = new Command({
        flags:{
          multi:{
            type:[Number, Array]
          }
        }
        ,args:[ '--multi=1', '--multi=2', '--multi=3' ]
      });
      ttt.deepEqual( [1,2,3], MultiCommand.argv.multi );
      ttt.end()
    });

    tt.test('should accept short hand flags', function(ttt){
      var Short = new Command({
        flags:{
          "short":{
            type:String
            ,shorthand:'s'
          }
        }
        ,args:[ '-s', 'short' ]
      });
      ttt.strictEqual( 'short', Short.argv.short );
      ttt.end()
    });

    tt.test('should accept default values', function(ttt){
      var DefaultCommand = new Command({
        flags:{
          one:{
            type:Number
            ,default:1
          }

          ,two:{
            type: String
            ,default:"two"
          }
        }
      });

      ttt.equal( 1, DefaultCommand.argv.one );
      ttt.equal( 'two', DefaultCommand.argv.two );

      DefaultCommand.reset();

      DefaultCommand.setOptions({
        args:['--one=2']
      });

      ttt.equal( 2, DefaultCommand.argv.one );
      ttt.end()
    });

    tt.test('should throw an exception for required fields if not supplied', function(ttt){
      var RequiredCommand = new Command({
        flags:{
          one:{
            type:Number
            ,required:true
          }
        }
      });

      domain.remove( RequiredCommand );
      ttt.rejects(RequiredCommand.run());
      RequiredCommand.reset();
      RequiredCommand.setOptions({
        args:['--one=1']
      });

      ttt.doesNotThrow(async () => {
        await RequiredCommand.run()
      },'should not thow');
      ttt.end()
    });

    tt.test('should throw execption when validation fails', function(ttt) {
      var ValidationCommand = new Command({
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
      ttt.end()
    });
    tt.end()
  });

  t.test("#run", function(tt){
    tt.test('should emit events for marked flags', function(ttt){
      ttt.plan(3)
      var EventCommand = new Command({
        args:[ '--one', '--no-two']
        , flags:{
          one:{
            type:Boolean
            ,event:true
          }
          ,two:{
            type:Boolean
            ,event:true
          }
        }
      , run: async function( cmd, data) {
          return (data.one && data.two );
        }
      });

      EventCommand.on('one', function( value ){
        ttt.equal( true, value );
      });

      EventCommand.on('two', function( value ){
        ttt.equal( false, value );
      });

      EventCommand.on('content', function( value ){
        ttt.equal( false, value );
      });

      EventCommand.run( null );

    });

    tt.end()
  });

  t.test("Subclassing", function(tt){
    tt.test('should allow for subclassing',function(ttt){

      let defaults = {
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

      var Alt = new AltCommand({
        flags:{
          test:{
            type:Boolean
            ,event:false
          }
        }
      });
      cli.use( 'alt', Alt );
      ttt.notEqual( cli.list.indexOf( 'alt' ), -1 );
      ttt.equal( Alt.fake(), false );
      ttt.equal( cli.commands.alt.fake(), false );
      ttt.end()
    });

    tt.end()
  });

  t.test('Aliasing', function(tt){
    tt.test('from string',function(ttt){
      ttt.afterEach(function(cb){
        cli.commands.reset();
        cb()
      });

      ttt.test('should generate command alias', function(tttt){
        var SingleAlias = new Command({
          alias: 'singel'
          ,run: function(){}
        });

        cli.use('single', SingleAlias);

        tttt.ok( cli.commands.hasOwnProperty('single'))
        tttt.ok( cli.commands.hasOwnProperty('singe'))
        tttt.ok( cli.commands.hasOwnProperty('singel'))
        tttt.end()
      });
      ttt.end()
    });

    tt.test('from Array',function(ttt){
      ttt.test('should generate multipl command alias', function(tttt){
        var SingleAlias = new Command({
          alias: ['singel', 'snigle']
          ,run: function(){}
        });

        cli.use('single', SingleAlias);
        tttt.ok( cli.commands.hasOwnProperty('single'))
        tttt.ok( cli.commands.hasOwnProperty('sni'))
        tttt.ok( cli.commands.hasOwnProperty('snigle'))
        tttt.ok( cli.commands.hasOwnProperty('singel'))
        tttt.end()
      });
      ttt.end()
    })
    tt.end()
  })
  t.test("Directive parsing", function(tt){
    tt.test('should pass the first non-flag argument to run', function(ttt){
      var DirectiveCommand = new Command({
        flags:{
          test:{
            type:Boolean
            ,default:true
          }
        }
        ,run: function( cmd ){
          assert.notStrictEqual( cmd, null );
          assert.equal( cmd, "test");
        }
      });

      DirectiveCommand.setOptions({
        args:['test', '--test']
      });

      DirectiveCommand.run(null);

      DirectiveCommand.reset();

      ttt.throws(function(){
        // should throw because it is expecting test
        // sending fake should make its way to the run function
        const stream = new stream.Passthrough()
        DirectiveCommand.run('fake');
      });

      ttt.end()
    });
    tt.end()
  });

  t.test('strict mode', (tt) => {
    tt.plan(1)
    const log = console.log
    console.log = () => {}
    tt.on('end', () => {
      console.log = log
    })
    var DirectiveCommand = new Command({
      strict: true
    , flags: {
        test: {
          type: Boolean
          ,default: true
        }
      }
    , run: async function( cmd, data, done ){
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
