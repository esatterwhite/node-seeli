---
prev: false
next: ./guides/commands
---
# Getting Started

## Installation

```bash
$ npm install seeli
```

## Running Seeli

Seeli has a `run` function that reads any arguments and flags from terminal input
and either executes the appropriate command, or displays help messages.

```javascript
// cli.js
'use strict'
var seeli = require('seeli')
seeli.run()
```

```shell
$ node ./cli
Usage:  seeli <command> [options]

Where <command> is the name the command to execute
*  help - displays information about available commands
```

A command is an instance of the `seeli.Command` class. Its only requirement is
that it has a function named `run` that returns a promise. What the function does is up to you.

```javascript
const seeli = require('seeli')
const command = new seeli.Command({
  run: asnyc() => {
    return 'hello world'
  }
});
```

## Configuring Seeli

Seeli has a simple configuration system exposed as a single function 
* `seeli.config`: gets or sets configuration values based on inputs


```javascript
'use strict'

const seeli = require('seeli')
seeli.config('exitOnError', true) // set a value
seeli.config('exitOnError') // get a value
seeli.config
```

There are a few global options you can manipulate to change basic behaviors
of seeli

* `help`: Absolute path to a command to use for the help command. You can use the to use your own help command.
* `exitOnError`: If an error is encountered, seeli will try to forcefully exit
* `exitOnContent`: When a command successfully completes and returns, seeli will try to forcefully exit
* `name`: The name of the exposed command line tool. If not set, the name will default to the name of the file the program is executed from.
* `color`: The primary accent color (default `green`). The is used by the default
* `plugins`: An array of function or requireable module names that export function

```javascript
'use strict'

const seeli = require('seeli')
seeli.config('color', 'red')

console.log(seeli.colorize('this is red'))
```

#### package.json

In an effort to remove boilerplate, it is also possible to define your configuration
under a `seeli` key in you package.json

```json
{
  "name": "my-command",
  "version": "0.0.0",
  "seeli": {
    "color": "blue",
    "plugins": [
      "@mycommand/bar",
      "@mycommand/foo"
    ]
  }
}
```

## Commands

### Executing Commands

There a two ways a command can be executed.

1. Manually call the `run` function
2. Registered with seeli and invoked via terminal

You can return anything from the `run` function of a command. Seeli will automatically
print string output from registered commands to `stdout`


```javascript
const seeli = require('seeli')
const command = new seeli.Command({
  run: asnyc () => {
    return 'hello world'
  }
});

command.run().then(console.log)
// hello world
```

### Registering Commands

Interacting with commands programmatically can be good for testing and
command chaining. More often than not you will want to execute commands based
on input from a terminal. To do that, you register commands with seeli
using the `use` command.


```javascript
// cli.js
'use strict'

const seeli = require('seeli')

const hello = new seeli.Command({
  run: async () => {
    return 'hello'
  }
})

const goodbye = new seeli.Command({
  run: async () => {
    return 'good bye'
  }
})

seeli.use('hello', hello)
seeli.use('goodbye', goodbye)

seeli.run()
```

```bash
$ cli hello
# hello

$ cli goodbye
# good bye
```

### Naming Commands

Commands can be named explicitly when they are registered with `seeli.use`.
Alternatively, a comand can specify a `name` property and an explicit name
can be omitted when registering

```javascript
'use strict'
const seeli = require('seeli')

const hello = new seeli.Command({
  run: async () => {
    return 'hello'
  }
})

const goodbye = new seeli.Command({
  name: 'goodbye'
  run: async () => {
    return 'good bye'
  }
})

// explicit naming
seeli.use('hello', hello)

// implicit naming
seeli.use(goodbye)
```

### Aliasing Commands

All commands are given a set of short hand alias names based on the name of the command.
These shorthands are generated using the [abbrev package](https://www.npmjs.com/package/abbrev).
Additionally, each command can specify an array of alias names using the `alias` option

```javascript
'use strict'
const seeli = require('seeli')
const help = new seeli.Command({
  name: 'help'
, alias: ['hlep']
, run: async () => {}
})
seeli.use(help)
```

The above command can be invoked with the following names `h`, `he`, `hel`, `help`, or `hlep`

## Deployment

### Directory Structure

```
├── bin
│   ├── cli.js
│   └── commands
│       ├── index.js
│       ├── one.js
│       ├── three.js
│       └── two.js
├── index.js
├── lib
│   └── index.js
└── package.json
```

### package.json

```json
{
  "bin": {
    "mycli": "./bin/cli.js"
  },
  "seeli": {
    "name": "mycli",
    "color": "blue"
  }
}
```

### Entrypoint

You entry point script will need too register all of your commands and execute seeli.

```javascript
// bin/cli.js
'use strict'

const seeli = require('seeli')
const commands = require('./bin/commands')

for (const command of Object.values(commands)) {
  seeli.use(command)
}

module.exports = seeli

if (require.main === module) seeli.run()
```

### Installation

Your command line to can be installed from your project locally with `npm link`.
Or it can be installed globally with your package using the `-g` flag of npm `install`
With this configuration, it will be available as `mycli`

```bash
$ npm link .
$ mycli
```

or if published the to the npm registry

```bash
$ npm install my-project -g
$ mycli
```


