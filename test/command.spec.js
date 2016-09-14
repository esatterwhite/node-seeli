/* jshint laxcomma: true, smarttabs: true, node: true */
const assert  = require("assert");
const cli     = require("../")
const Command = require("../lib/command");
const chalk   = require("chalk");
const os      = require("os");
const domain      = require('../lib/domain')

describe('command', function(){

	// description parsing
	describe('~description', function(){
		it('should accept a single string', function(){
			DescriptionCommand = new Command({
				description:"a test command"
			});
			assert.equal('a test command', DescriptionCommand.description );

			DescriptionCommand.setOptions({
				description:"a different description"
			});

			assert.equal("a different description", DescriptionCommand.description );

		});
	});

	// usage parsing
	describe('~usage', function(){


		it('should accept a single string', function(){
			var UsageCommand = new Command({
				usage:"usage -a 'fake' --verbose"
			});

			var out = [
				"usage -a 'fake' --verbose",
				"Options:",
				"  -i, --interactive, --no-interactive <boolean> [false] Use the interactive propmts",
				"     --color, --no-color <boolean> [true] Enable ANSI color in output",
				"  ",
                "  <...>: input type | *: repeatable flags | [...]: default values"
			].join(os.EOL );
			assert.equal(out.trim(),chalk.stripColor( UsageCommand.usage ).trim() );
		});

		it('should accept an array of strings', function(){
			var UsageCommand = new Command({
				usage:[
					"usage -a 'fake' --verbose",
					"usage -b 'tesk' --no-verbose",
				]
			});

			var out = [
				"usage -a 'fake' --verbose",
				"usage -b 'tesk' --no-verbose",

				"Options:",
				"  -i, --interactive, --no-interactive <boolean> [false] Use the interactive propmts",
				"     --color, --no-color <boolean> [true] Enable ANSI color in output",
				"  ",
                "  <...>: input type | *: repeatable flags | [...]: default values"
			].join(os.EOL );
			assert.equal( out, chalk.stripColor( UsageCommand.usage ) );
		});
	});

	// internal argv parsing
	describe('~argv', function(){
		it('should accept an array of arguments', function(){
			var ArgCommand = new Command({
				args:['--no-color']
			});
			assert.strictEqual( false, ArgCommand.argv.color);
			ArgCommand.reset();

			ArgCommand.setOptions({
				args:['--color']
			});

			assert.strictEqual( true, ArgCommand.argv.color);
		});

		it('should understand unknown flags', function(){
			var ArgCommand = new Command({
				args:['--no-color', '--fake']
			});
			assert.strictEqual( false, ArgCommand.argv.color);
			assert.strictEqual( true, ArgCommand.argv.fake);
		});
	});

	// flag parsing
	describe("~flags", function(){
		
		it('should accept String Types', function(){
			var StringCommand = new Command({
				flags:{
					string:{
						type:String
					}
				}
				,args:[ '--string=fake' ]
			});

			assert.strictEqual( 'fake', StringCommand.argv.string );
		});

		it('should accept Boolean Types', function( ){
			var BooleanCommand = new Command({
				flags:{
					bool:{
						type:Boolean
					}
				}
				,args:[ '--bool' ]
			});

			assert.strictEqual( true, BooleanCommand.argv.bool );
			BooleanCommand.reset();
			BooleanCommand.setOptions({
				args:['--no-bool']
			});
			assert.strictEqual( false, BooleanCommand.argv.bool );

		});

		it('should accept Number Types', function(){
			var NumberCommand = new Command({
				flags:{
					num:{
						type:Number
					}
				}
				,args:[ '--num=1' ]
			});

			assert.strictEqual( 1, NumberCommand.argv.num );
		});



		it('should accept multiple value flags', function(){
			var MultiCommand = new Command({
				flags:{
					multi:{
						type:[Number, Array]
					}
				}
				,args:[ '--multi=1', '--multi=2', '--multi=3' ]
			});
			assert.deepEqual( [1,2,3], MultiCommand.argv.multi );
		});

		it('should accept short hand flags', function(){
			var Short = new Command({
				flags:{
					"short":{
						type:String
						,shorthand:'s'
					}
				}
				,args:[ '-s', 'short' ]
			});
			assert.strictEqual( 'short', Short.argv.short );
		});

		it('should accept default values', function(){
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

			assert.equal( 1, DefaultCommand.argv.one );
			assert.equal( 'two', DefaultCommand.argv.two );

			DefaultCommand.reset();

			DefaultCommand.setOptions({
				args:['--one=2']
			});

			assert.equal( 2, DefaultCommand.argv.one );
		});

		it('should throw an exception for required fields if not supplied', function(){
			var RequiredCommand = new Command({
				flags:{
					one:{
						type:Number
						,required:true
					}
				}
			});
	
			domain.remove( RequiredCommand );
			assert.throws(function(){
				RequiredCommand.run();
			}, 'should throw an error');

			RequiredCommand.reset();
			RequiredCommand.setOptions({
				args:['--one=1']
			});

			assert.doesNotThrow(function(){
				RequiredCommand.run();
			},'should not thow');
		});
	});

	describe("#run", function(){
		it('should emit events for marked flags', function(){
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
			  , run: function( cmd, data, done ){
			  	done( null, data.one && data.two );
			  }
			});

			EventCommand.on('one', function( value ){
				assert.equal( true, value );
			});

			EventCommand.on('two', function( value ){
				assert.equal( false, value );
			});

			EventCommand.on('content', function( value ){
				assert.equal( false, value );
			});

			EventCommand.run( null );

		});
	});

	describe("Subclassing", function(){
		it('should allow for subclassing',function(){

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
			assert.notEqual( cli.list.indexOf( 'alt' ), -1 );
			assert.equal( Alt.fake(), false );
			assert.equal( cli.commands.alt.fake(), false );
		});
	});

	describe('Aliasing', function(){
		describe('from string',function(){
			afterEach(function(){
				cli.commands.reset();
			});

			it('should generate command alias', function(){
				var SingleAlias = new Command({
					alias: 'singel'
					,run: function(){}
				});

				cli.use('single', SingleAlias);

				assert.ok( cli.commands.hasOwnProperty('single'))
				assert.ok( cli.commands.hasOwnProperty('singe'))
				assert.ok( cli.commands.hasOwnProperty('singel'))
			});
		});

		describe('from Array',function(){
			it('should generate multipl command alias', function(){
				var SingleAlias = new Command({
					alias: ['singel', 'snigle']
					,run: function(){}
				});

				cli.use('single', SingleAlias);
				assert.ok( cli.commands.hasOwnProperty('single'))
				assert.ok( cli.commands.hasOwnProperty('sni'))
				assert.ok( cli.commands.hasOwnProperty('snigle'))
				assert.ok( cli.commands.hasOwnProperty('singel'))
			});
		})
	})
	describe("Directive parsing", function(){
		it('should pass the first non-flag argument to run', function(){
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

			assert.throws(function(){
				// should throw because it is expecting test
				// sending fake should make its way to the run function
				DirectiveCommand.run('fake');
			});

		});
	});

});
