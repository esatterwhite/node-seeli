node-seeli ( C-L-I )
======================

Object orientated, event driven CLI module


```js
var cli = require("seeli")
 var Test = new cli.Command({
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
			var value = "Hello, " + data.name[x]
			if( data.excited ){
				value += '!'
			}
			out.push( value );

		}
		out = out.join('\n');

		out = data.value == 'screaming' ? out.toUpperCase() : out;
		cb( null, out );
	}
});
cli.use('test', Test)
cli.run();
```

now you will have a fully functional test command with help and an interactive walk through

```
node cli.js help test 
node cli.js test --help
node cli.js test --interactive
node cli.js test --name=mark --name=sally --no-excited
```

## Options

name | type | default | description
-----|:-----:|--------|-------------
**description** | `String` |  **""**
**args** | `Array` | **null**
**interactive** | `Boolean` | **true**
**usage** | `String` / `Array` | **""**
**flags** | `Object` | **{}**
**run** | `Function` | **no-op**

### Flag Options

* **type** ( required ): The type of input that is expected. Boolean types to not expect input. The present of the flag implies `true`. Additionally, boolean flags allow for `--no-<flag>` to enforce `false`. If you want to accept muliple values, you specify type as an array with the first value being the type you which to accept. For example `[String, Array ]` means you will accept multiple string values.
* **descrption**: a description of the flag in question. 
* **shorthand**: An options short hand flag that will be expanded out to the long hand flag.
* **default**: A value to return if the flag is omitted.
* **choices**: Used only during an interactive command. Restricts the users options only to the options specified
* **skip**: if set to `true` this flag will be omitted from the interactive command prompts
* **event**: if set to `true` the command will emit an event withe the same name as the flag with the value that was captured for that flag
