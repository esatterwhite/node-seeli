![build image](https://travis-ci.org/esatterwhite/node-seeli.svg?branch=master)&nbsp;![package dependancies](https://david-dm.org/esatterwhite/node-seeli.png)
[![Codacy Badge](https://www.codacy.com/project/badge/47a935a723c94c73bc97d749836ee489)](https://www.codacy.com/app/esatterwhite/node-seeli)

seeli ( C. L. I. )
======================

Object orientated, event driven , **Interactive** CLI module. Seeli aims to give you the tools to compose
A command line interface the way you want it, and otherwise, stays out of your way.

![gif](https://raw.githubusercontent.com/esatterwhite/node-seeli/master/assets/seeli.gif "interactive mode")

```js
var cli = require("seeli")
var Hello = new cli.Command({
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

        out = data.volume == 'screaming' ? out.toUpperCase() : out;
        cb( null, out );
    }
});
cli.use('world', Hello)
cli.run();
```

now you will have a fully functional world command with help and an interactive walk through

```
node cli.js help world
node cli.js world --help
node cli.js world --interactive
node cli.js world --name=Mark --name=Sally --no-excited
```



## Seeli.run( )

Executes The command line interface

## Seeli.list`<Array>`

List of all top level registered commands

## Seeli.exitOnError `<Boolean>`

If set to turn seeli will exit the process when it encouters an error. If false, it will leave error handling up to
the parent application

## Seeli.use( name `<string>`, cmd `<Command>` )

Registers a new command under the specified name where the name will invoke the associated command

```js
var cli = require('seeli')
var Cmd = new cli.Command();

cli.use('test', Cmd )
cli.run()
```


## Seeli.bold( text `<string>`)

wraps text in the ansi code for bold

## Seeli.green( text `<string>`)

wraps text in the ansi code for green

## Seeli.blue( text `<string>`)

wraps text in the ansi code for blue

## Seeli.red( text `<string>`)
wraps text in the ansi code for red

## Seeli.yellow( text `<string>`)

wraps text in the ansi code for yellow

## Seeli.cyan( text `<string>`)

wraps text in the ansi code for cyan

## Seeli.magenta( text `<string>`)

wraps text in the ansi code for magenta

## Seeli.set( key `<string>`, value `<object>` )

sets a conf value.

## Seeli.get( key `<string>` )

A config value to look up. Can be a dot separated key to look up nested values

#### Supported Confgurations

* color `<String>` - The chalk color to use when outputting help text. default `green`
* name `<String>`   - the name of the command that is used in generated help
* help `<String>`  - a file path or module name to a custom help command. This will be passed to `require` and must export a single command instance
    * `seeli.set('help', '/path/to/help/command')`

## Command( options `<object>` )

## Options

name | type | default | description
-----|:-----:|--------|-------------
**description** | `String` |  `""` | Used to render help output
**args** | `Array` | `null` | if supplied, `agrs` will be used instead of `process.argv`
**interactive** | `Boolean` | `true` | If set to false, the flag will be excluded from the interactive prompts
**usage** | `String` / `Array` | `""` | A string or array of strings used to generate help text
**flags** | `Object` | `{}` | key value pairs used to control the command where keys are the name of the flag and the values is a configuration object for the flag
**run** | `Function` | `no-op` | A function used as the body of the command. it will be passed a `name`, a `data` object containing the processed values from the command input and a `done` function to be called when the command is done.

### Flag Options
name | required | type | description
-----|:--------:|:----:|------------
**type** |  `true` | `string` |The type of input that is expected. Boolean types to not expect input. The present of the flag **implies** `true`. Additionally, boolean flags allow for `--no-<flag>` to enforce `false`. If you want to accept multiple **values**, you specify type as an array with the first value being the type you which to accept. For example `[String, Array ]**`** means you will accept multiple string values.|
**description** | `false` | `string` |  a description of the flag in question.  |
**required** | `false` | `boolean` |  If set to `true` a `RequiredFieldError` will be emitted  |
**shorthand**  | `false` | `string` | An options short hand flag that will be expanded out to the long hand flag. |
**default**    | `false` | `mixed` | A value to return if the flag is omitted. |
**mask**       | `false` | `boolean` | **interactive mode only** Sets the input type to masked input to hide values
**choices**    | `false` | `array` | Used only during an interactive command. Restricts the users options only to the options **specified** |
**skip**       | `false` | `boolean` | **interactive mode only** - if set to `true` this flag will be omitted from the interactive command prompts |
**event**      | `false` | `boolean` | if set to `true` the command will emit an event withe the same name as the flag with **the** value that was captured for that flag |
**when** | `false` | `function` | **interactive mode only** Receives the current user answers hash and should return true or **false** depending on whether or not this question should be asked.
**validate** | `false` | `function` |  receives user input and should return true if the value is **valid**, and an error message (String) otherwise. If false is returned, a default error message is provided.
**filter** | `false` | `function` | **interactive mode only** Receives the user input and return the filtered value to be used **inside** the program. The value returned will be added to the Answers hash.

#### Nested Flags

Flag names that contain a colon (`:`) will be parsed as a nested value in the data that is return to you commands. You can Set arbitrarily deep values.
You can use this to automatically construct complext object. Array values are limited to primitive types

```javascript
// cli ---foo:bar:foobar=hello --foo:bar:baz=world --nested:array=1 --nested:array=2

{
  foo: {
    bar: {
      foobar: "hello"
    , baz: "world"
    }
  }
, nested: {
    array: [1, 2]
  }
}
```

## Auto Help

Seeli will generate help from the usage string and flags. You can help as a command `seeli help <command>` or as a flag `seeli <command> --help`

## Asyncronous

Your defined `run` function will be passed a `done` function to be called when your command has finished. This allows you to do complex async operations and I/O. The `done` callback accepts an error, if there is one, and the final output to be displayed for your command.

## Events

Instances of the seeli Command or Commands the inherit from it as also instances of the `EventEmitter` class. By default any flag that has its `event` option set to `true` will emit an event with the value of of the flag before the run function is executed.

```js
var EventCommand = new cli.Command({
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
    done( null, data.one && data.two )
  }
});

EventCommand.on('one', function( value ){
    assert.equal( true, value );
});

EventCommand.on('two', function( value ){
    assert.equal( false, value )
});

EventCommand.on('content', function( value ){
    assert.equal( false, value );
});

EventCommand.run( null );
```

## Errors

Errors are handled by Node's error [domains](http://nodejs.org/api/domain.html). Each command will run inside of its own domain and will emit an error event if and error is passed to the `done` callback from the `run` method. Seeli will suppress trace messages by default. You can use the `--traceback` flag on any command to surface the full stack trace. If the error object emitted has a `code` property that is a non zero value, seeli will forcefully exit the process with the error code.

```js
var cli = require("seeli")
var ErrCmd = new cli.Command({
    run: function(){
        var e = new Error("Invalid Command")
        e.code = 10;
        this.emit('error',e )
    }
});
```
