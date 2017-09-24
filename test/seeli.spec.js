var cli    = require('../');
var test    = require('tap').test

test('cli', function(t){
  t.test('color functions', function(tt){
    const colors = ['red', 'blue','green', 'yellow','bold', 'grey', 'dim', 'black', 'magenta', 'cyan'];
    for (const color of colors) {
      tt.type(cli[color], Function, `${color} should be a top level function`);
    }
    tt.end()
  });

  t.test('conf', function(tt){
    tt.test('should store default values', function(ttt){
      ttt.ok(cli.get('name'))
      ttt.ok(cli.get('color'))
      ttt.ok(cli.get('help'))
      ttt.end()
    });

    tt.test('should allow arbitrary values', function(ttt){
      cli.set('test', 1 );
      ttt.equal( cli.get('test'), 1 )
      ttt.end()
    });

    tt.end()
  });


  t.test('#use', function(tt){
    var TestCommand = new cli.Command({

    });

    tt.test('should allow commands to be registered by name', function(ttt){
      cli.use('test', TestCommand);
      ttt.notEqual( cli.list.indexOf('test'), -1 );
      ttt.end()
    });

    tt.test("#list", function(ttt){
      ttt.test('should return an array', function(tttt){
        tttt.ok( Array.isArray( cli.list ) );
        tttt.end()
      });

      ttt.test('should only list top level commands', function(tttt){
        tttt.notEqual(cli.list.indexOf('test'), -1  );
        tttt.notEqual(cli.list.indexOf('help'), -1  );
        tttt.equal(cli.list.indexOf('h'), -1  );
        tttt.equal(cli.list.indexOf('he'), -1  );
        tttt.equal(cli.list.indexOf('hel'), -1  );
        tttt.end()
      });

      ttt.end()
    });

    tt.end()
  });

  t.end()
});
