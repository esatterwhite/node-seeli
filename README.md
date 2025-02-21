[![Test + Release](https://github.com/esatterwhite/node-seeli/actions/workflows/release.yml/badge.svg)](https://github.com/esatterwhite/node-seeli/actions/workflows/release.yml)
![package dependancies](https://david-dm.org/esatterwhite/node-seeli.png)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/47a935a723c94c73bc97d749836ee489)](https://www.codacy.com/app/esatterwhite/node-seeli?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=esatterwhite/node-seeli&amp;utm_campaign=Badge_Grade)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# seeli ( C. L. I. )

Object orientated, event driven , **Interactive** CLI module. Seeli aims to give you the tools to compose
A command line interface the way you want it, and otherwise, stays out of your way.

![gif](https://raw.githubusercontent.com/esatterwhite/node-seeli/master/assets/seeli.gif "interactive mode")

```js
const os = require('os')
const cli = require('seeli')

cli.config({
  exitOnError: true
, color: 'green'
, name: 'hello'
})

const Hello = new cli.Command({
  description:"displays a simple hello world command"
, name: 'world'
, ui: 'dots'
, usage: [
    `${cli.bold("Usage:")} ${cli.config('name')} world --interactive`
  , `${cli.bold("Usage:")} ${cli.config('name')} world --name=john`
  , `${cli.bold("Usage:")} ${cli.config('name')} world --name=john --name=marry --name=paul -v screaming`
  ]

, flags: {
    name: {
      type: [ String, Array ]
    , shorthand: 'n'
    , description: 'The name of the person to say hello to'
    , required: true
    }

  , 'nested:value' : {
      type: Number
    , shorthand: 'nv'
    , description: 'A nested value'
    , name: 'nested'
    }

  , excited: {
      type:Boolean
    , shorthand: 'e'
    , description: 'Say hello in a very excited manner'
    , default:false
    }

  , volume:{
      type: String
    , choices: ['normal', 'screaming']
    , description: 'Will yell at each person'
    , default: 'normal'
    , shorthand: 'v'
    }
  }
, onContent: (content) => {
    // command success
    // content is the final output from run function
    // If a string is returned by `run`, it will print automatically. If it's a data
    // structure, then this method can be used to display it however.

    console.log(content.join(os.EOL))
  }

, run: async function(cmd, data) {
    const out = []
    this.ui.start('processing names')
    var names = Array.isArray( data.name ) ? data.name : [ data.name ]
    for (var x = 0; x < names.length; x++) {
      this.ui.text = (`processing ${names[x]}`)
      await new Promise((resolve) => {
        setTimeout(() => {
          let value = "Hello, " + names[x]
          if( data.excited ){
            value += '!'
          }

          out.push(data.volume === 'screaming' ? value.toUpperCase() : value)
          resolve(true)
        }, 1000 * x + 1)
      })
    }

    this.ui.succeed('names processed successfully')
    // Anything returned from run is emitted from the `content` event.
    // Strings will automatically be written to stdout.
    return out
  }
})

cli.use(Hello)
cli.run()
```

now you will have a fully functional `hello world` command with help and an interactive walk through

```
node ./cli help world
node ./cli world --help
node ./cli world --interactive
node ./cli world --name=Mark --name=Sally --no-excited
```

<!-- vim-markdown-toc GFM -->

- [seeli ( C. L. I. )](#seeli--c-l-i-)
- [API](#api)
  - [Seeli.Command(`<Command>`)](#seelicommandcommand)
    - [Command Options](#command-options)
    - [Flag Options](#flag-options)
    - [Nested Flags](#nested-flags)
    - [`cmd` Shape](#cmd-shape)
  - [Seeli.run( )](#seelirun-)
  - [Seeli.list`<Array>`](#seelilistarray)
  - [Seeli.use( \[name `<string>`,\] cmd `<Command>` )](#seeliuse-name-string-cmd-command-)
  - [Seeli.bold( text `<string>`)](#seelibold-text-string)
  - [Seeli.green( text `<string>`)](#seeligreen-text-string)
  - [Seeli.blue( text `<string>`)](#seeliblue-text-string)
  - [Seeli.red( text `<string>`)](#seelired-text-string)
  - [Seeli.yellow( text `<string>`)](#seeliyellow-text-string)
  - [Seeli.cyan( text `<string>`)](#seelicyan-text-string)
  - [Seeli.magenta( text `<string>`)](#seelimagenta-text-string)
  - [Seeli.redBright( text `<string>`)](#seeliredbright-text-string)
  - [Seeli.blueBright( text `<string>`)](#seelibluebright-text-string)
  - [Seeli.greenBright( text `<string>`)](#seeligreenbright-text-string)
  - [Seeli.yellowBright( text `<string>`)](#seeliyellowbright-text-string)
  - [Seeli.cyanBright( text `<string>`)](#seelicyanbright-text-string)
  - [Seeli.config( key `<string>`, value `<object>` )](#seeliconfig-key-string-value-object-)
  - [Seeli.config( opts `<object>` )](#seeliconfig-opts-object-)
    - [Config Options](#config-options)
  - [Seeli.config( key `<string>` )](#seeliconfig-key-string-)
- [Package Configuration](#package-configuration)
- [Auto Help](#auto-help)
- [Asyncronous](#asyncronous)
- [Showing Progress](#showing-progress)
- [Events](#events)

<!-- vim-markdown-toc -->
# API

## Seeli.Command(`<Command>`)

A constructor for creating a command, including its flags and `run` method to be executed by `Seeli.run()`.  See [Command Options](#command-options) on how to configure a command.

### Command Options

name | type | default | description
-----|:-----:|--------|-------------
**description** | `String` |  `""` | Used to render help output
**strict** | `Boolean` |  `false` | When true, commands will error when the receive unknown flags
**args** | `Array` | `null` | if supplied, `agrs` will be used instead of `process.argv`
**interactive** | `Boolean` | `true` | If set to false, the command will not offer interactive mode
**usage** | `String` / `Array` | `""` | A string or array of strings used to generate help text
**flags** | `Object` | `{}` | key value pairs used to control the command where keys are the name of the flag and the values is a configuration object for the flag
**ui** | `String` | `dots` | The kind of [progress indicator](https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json) your command should use. After instantiation, this becomes an instance of [ora](https://www.npmjs.com/package/ora) used to print output.
**run** | `Function` | `no-op` | An async function used as the body of the command. It will be passed a `subcommand` name if one was passed, and a `data` object containing the processed values from the command input.
**commands** | `Command[]` | `[]` | A list of additional command to utilize as sub commands.

### Flag Options
name | required | type | description
-----|:--------:|:----:|------------
**type** |  `true` | `string` |The type of input that is expected. Boolean types to not expect input. The present of the flag **implies** `true`. Additionally, boolean flags allow for `--no-<flag>` to enforce `false`. If you want to accept multiple **values**, you specify type as an array with the first value being the type you which to accept. For example `[String, Array ]**`** means you will accept multiple string values.|
**description** | `false` | `string` |  A description of the flag in question.  |
**required** | `false` | `boolean` |  If set to `true` a `RequiredFieldError` will be emitted  |
**shorthand**  | `false` | `string` | An options short hand flag that will be expanded out to the long hand flag. |
**interactive** | `false` | `boolean` | If set to false the flag will omitted from interactive prompts
**default**    | `false` | `mixed` | A value to return if the flag is omitted. |
**mask**       | `false` | `boolean` | **interactive mode only** Sets the input type to masked input to hide values
**choices**    | `false` | `array` | Used only during an interactive command. Restricts the users options only to the options **specified** |
**multi**      | `false` | `boolean` | **interactive mode only** If choices is specified, and multi is true, this user will be presented a multi checkbox UI allowing them to pick multiple values. The return value will be an array
**skip**       | `false` | `boolean` | **interactive mode only** - if set to `true` this flag will be omitted from the interactive command prompts |
**event**      | `false` | `boolean` | If set to `true` the command will emit an event withe the same name as the flag with **the** value that was captured for that flag |
**when** | `false` | `function` | **interactive mode only** Receives the current user answers hash and should return true or **false** depending on whether or not this question should be asked.
**validate** | `false` | `function` |  A synchronous function that receives the command object, which should return `true` or `undefined` if the value is **valid**. Otherwise, an error message (String) can be returned, and it will be rendered. If `false` is returned, a default error message is provided.
**filter** | `false` | `function` | Receives the user input and return the filtered value to be used **inside** the program. The value returned will be added to the Answers hash.

### Nested Flags

Flag names that contain a colon (`:`) will be parsed as a nested value in the data that is return to you commands. You can Set arbitrarily deep values.
You can use this to automatically construct complex object. Array values are limited to primitive types

```javascript
// cli --foo:bar:foobar=hello --foo:bar:baz=world --nested:array=1 --nested:array=2

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

### `cmd` Shape

Functions will often be passed the `cmd` object for use inside the function. This object contains all of the user-inputted flags as well as internal fields from raw argument parsing (which can largely be ignored by the user).

Example:

```js
const fs = require('fs')

// ...snip

, validate: (cmd) => {
    console.log('cmd contents', cmd)

    // Clear the output file before each run
    if (cmd.output_file) {
      fs.rm(cmd.output_file, {force: true}, () => {})
    }
  }
```

Output:

```bash
cmd contents {
  my_param1: 'hello',
  my_param2: 'goodbye',
  output_file: '/tmp/output.txt',
  my_optional_param: undefined
  argv: {
    remain: [<internal flag processing>],
    cooked: [<internal flag processing>],
    original: [<internal flag processing>]
  },
  interactive: false,
  color: true,
}
```
## Seeli.run( )

Executes The command line interface

## Seeli.list`<Array>`

List of all top level registered commands

## Seeli.use( [name `<string>`,] cmd `<Command>` )

Registers a new command where the Command's `name` will invoke the associated command.
Optionally, a different `name` can be passed as the first parameter which would override
the value of `Command.name`.

```js
const cli = require('seeli')
const UnnamedCmd = new cli.Command()
const NamedCommand = new cli.Command({name: 'my_command'})

cli.use('test', UnnamedCmd)
cli.use(NamedCommand)
cli.run()
```


## Seeli.bold( text `<string>`)

Wraps text in the ansi code for bold.

## Seeli.green( text `<string>`)

Wraps text in the ansi code for green.

## Seeli.blue( text `<string>`)

Wraps text in the ansi code for blue.

## Seeli.red( text `<string>`)
Wraps text in the ansi code for red.

## Seeli.yellow( text `<string>`)

Wraps text in the ansi code for yellow.

## Seeli.cyan( text `<string>`)

Wraps text in the ansi code for cyan.

## Seeli.magenta( text `<string>`)

Wraps text in the ansi code for magenta.

## Seeli.redBright( text `<string>`)

Wraps text in the ansi code for redBright.

## Seeli.blueBright( text `<string>`)

Wraps text in the ansi code for blueBright.

## Seeli.greenBright( text `<string>`)

Wraps text in the ansi code for greenBright.

## Seeli.yellowBright( text `<string>`)

Wraps text in the ansi code for yellowBright.

## Seeli.cyanBright( text `<string>`)

Wraps text in the ansi code for cyanBright.

## Seeli.config( key `<string>`, value `<object>` )

Sets a single configuration value (see [Config Options](#config-options)).

## Seeli.config( opts `<object>` )

Set multiple configuration values using a single object.

### Config Options

* **color** `<String>` - The chalk color to use when outputting help text. default `green`
* **name** `<String>`   - the name of the primary command that is used in generated help. If this is not set, the filename is used.
* **exitOnError** `<Boolean>` - Seeli will forcefully exit the current process when an error is encountered. default `false`
* **exitOnContent** `<Boolean>` - Seeli will forefully exit the current process when it is passed output content from a command. default `true`
* **plugins** `<String>|<function>[]` - A list of plugins to load and execute. A plugin may be either a function, or a module id to be required.
  If it is a module id, the module must export a single function which will be passed the seeli instance when called.
* **help** `<String>`  - a file path or module name to a custom help command. This will be passed to `require` and must export a single command instance
    * `seeli.config('help', '/path/to/help/command')`

## Seeli.config( key `<string>` )

A config value to look up. Can be a dot separated key to look up nested values


# Package Configuration

Alternatively, initial configuration may be provided via `package.json` in a top-level key - `seeli`.
However, this is mostly for importing plugin packages that are published to a registry.

```json
{
  "seeli": {
    "color": "blue",
    "name": "whizbang",
    "plugins": [
      "@myscope/simple-command"
    ]
  }
}
```

# Auto Help

Seeli will generate help from the usage string and flags. You can help as a command `seeli help <command>` or as a flag `seeli <command> --help`

# Asyncronous

Your defined `run` function can be an async function, or a function that returns a `Promise`. This allows you to do complex async operations and I/O. If an error is thrown, it will be displayed.
Otherwise, the content returned from your `run` function will be output to stdout ( if it returned a `String`).

# Showing Progress

Your command's `run` function has access to an instance of [ora](https://www.npmjs.com/package/ora) available
in `this.ui`, allowing you to display progress indicators and helpful messages while you perform other work.
Optionally, if `this` is out of scope, you may also use the instance directly from `seeli`.
See the `README` in the [ora](https://www.npmjs.com/package/ora) repository for more info.

```js
const cli = require('seeli')

// Inside of Command
this.ui.fail('Some error message')
this.ui.text('Update the status bar')
this.ui.info('Informational text here')

// Outside of Command
function something() {
  cli.ui.success('My function was called!')
}
```

# Events

Instances of the seeli Command or Commands that inherit from it as also instances of the `EventEmitter` class. By default any flag that has its `event` option set to `true` will emit an event with the value of the flag before the run function is executed.

```js
var EventCommand = new cli.Command({
  args:[ '--one', '--no-two']
, flags:{
    one:{
      type:Boolean
    , event:true
    }
  , two:{
      type:Boolean
    , event:true
    }
  }
, run: async function( cmd, data ){
    return data.one && data.two
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

