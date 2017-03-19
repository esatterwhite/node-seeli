var assert = require("assert");
var cli    = require("../");

describe('cli', function(){
  describe('conf', function(){
    it('should store default values', function(){
      assert.ok(cli.get('name'))
      assert.ok(cli.get('color'))
      assert.ok(cli.get('help'))
    });

    it('should allow arbitrary values', function(){
      cli.set('test', 1 );
      assert.equal( cli.get('test'), 1 )
    });
  });
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
