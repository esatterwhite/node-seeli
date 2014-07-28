node-seeli ( SEE-EL-I)
======================

Object orientated, event driven CLI module


```js
var cli = require("seeli")
 * @example var x = new class({
 	Extends:Command
 	options:{
		description:"diaplays a simple hello world command"
		,usage:[
			"Usage: cli hello --interactive",
			"Usage: cli hello --name=john",
			"Usage: cli hello --name=john --name=marry --name=paul -v screaming"
		]
		,flags:{
			name:{
				type:[ String, Array ]
				,shorthand:'n'
				,description:"The name of the person to say hello to"
			}
			,excited: {
				type:Boolean
				,shorthand: 'e'
				,description:"Say hello in a very excited manner"
				,default:false
			}
			,volume:{
				type:String
				,choices:['normal', 'screaming']
				,default:'normal'
				,shorthand:'v'
			}
		}
		,run: function( cmd, data, cb ){
			var out = [];

			for( var x =0; x< data.name.length; x++ ){
				out.push( "Hello, " + data.name[x] + "!" );
			}
			out = out.join('\n');

			out = data.value == 'screaming' ? out.toUpperCase() : out;
			callback( out );
	
		}
 	}
});
cli.use('test', Test)
cli.run();
```

```
node cli.js help test 
```