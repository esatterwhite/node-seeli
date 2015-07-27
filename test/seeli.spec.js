var assert = require("assert");
var cli    = require("../");

describe('cli', function(){
	describe('#use', function(){
		var TestCommand = new cli.Command({

		});

		it('should allow commands to be registered by name', function(){
			cli.use('test', TestCommand);
			assert.notEqual( cli.list.indexOf('test'), -1 );
		});

		describe("#list", function(){
			it('should return an array', function(){
				assert.ok( Array.isArray( cli.list ) );
			});

			it('should only list top level commands', function(){
				assert.notEqual(cli.list.indexOf('test'), -1  );
				assert.notEqual(cli.list.indexOf('help'), -1  );
				assert.equal(cli.list.indexOf('h'), -1  );
				assert.equal(cli.list.indexOf('he'), -1  );
				assert.equal(cli.list.indexOf('hel'), -1  );
			});
		});

	});

});