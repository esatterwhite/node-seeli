---
prev: ../getting-started
next: ./interactive
---
# Commands

An instance of the `command` class represents a single executable unit.
The seeli framework parses user input and executes the appropriate command.
Commands handle basic validation, formatting help messages, prompting for
user input. The vast majority of this functionality is handled through **flags**

## Setup

Creating a new command is as simple as creating a new instance of a seeli
`Command` and passing it configuration options. Many of the options are used
by the default `help` command to render documentation. At the most basic, a
command should have a `name`, `description`, and some additional `usage` text.

```javascript
'use strict'

const seeli = require('seeli')
const name = seeli.get('name')
module.exports = new seeli.Command({
  name: 'simple'
, description: 'This is a simple example'
, usage: [
    `${name} example [options]`
  ]
})
```

This a basic skeleton for a command command, but it doesn't have any defined behavior.

## Execution

To define what a command does, you pass a `run` function that is responsible for
executing any and all command specific logic when the command is dispatched.
And javascript type can be returned from a `run` function. When a [String](https://mdn.io/string)
is returned, it will automatically be passed to `console.log`. When a return
value of type `string` is received, a `content` event is emitted with the return value.

```javascript
const {Command} = require('seeli')

module.exports = new Command({
  name: 'simple'
, description: 'This is a simple example'
, run: async function(command, data) {
    return 'hello world'
  }
})
```

```sh
$ cmd simple
> hello world
```

## Events

Commands are also [event emitters](https://nodejs.org/api/events.html#events_class_eventemitter). When defining a command, any function property the starts with
`on` will be attached as an event handler for the matching name, sans `on`

```javascript
module.exports = new Command({
  name: 'events'
, onCustom: function(...args) {
    console.log(...args)
  }
, run: async function() {
    this.emit('custom', 1, 2, 3)
  }
})
```

## Complex Content

To keep the concerns of presentation separate from logic and to ease
testing, it is a good idea to return structured data object from `run` handlers. Formatting should be done by an event handler for the `content` event.

<<< @/gh-pages/examples/commands/content.js{8-12}

```shell
$ cmd complex
> ℹ hello world
> ✔ complete
```

::: tip
compile and return structured output objects in your `run` functions
and delegate text rendering to the and other conditional behaviors to
event handlers
:::

This can also be useful in testing sutations or situations when
using a command programmatically. Being able to inspect a structured
value rather than capturing and parsing rendered output can make testing efforts
significantly easier.

```javascript{14}
const assert = require('assert')
const {Command} = require('seeli')

const hello = new Command({
  name: 'simple'
, run: async function(command, data) {
    return {message: 'hello world'}
  }
})

hello
  .run()
  .then((output) => {
    assert.deepEqual(output, {message: 'hello world'})
  })
```

## Flags

A flag represents a single value that you want to collect from user input.
When the command successfully executes, the collected values are passed to
the `run` function of your command as a single object.

A simple example would be collecting name and age of an individual


```javascript
const {Command} = require('seeli')

module.exports = new Command({
  name: 'personalize'
, flags: {
    name: {
      type: String
    , description: 'Your name'
    , shorthand: 'n'
    }
  , age: {
      type: Number
    , description: 'Your age in years'
    , shorthand: 'a'
    }
  }
, run: async function(command, data) {
    console.log(data.name)
    console.log(data.age)
  }
})
```
### Options

name | required | type | description
-----|:--------:|:----:|------------
**type** |  `true` | `string` |The type of input that is expected. Boolean types to not expect input. The present of the flag **implies** `true`. Additionally, boolean flags allow for `--no-<flag>` to enforce `false`. If you want to accept multiple **values**, you specify type as an array with the first value being the type you which to accept. For example `[String, Array]` means you will accept multiple string values.|
**description** | `false` | `string` |  a description of the flag in question. Used to generate help messages |
**required** | `false` | `boolean` |  If set to `true` a `RequiredFieldError` will be emitted  |
**shorthand**  | `false` | `string` | An optional shorthand name that will be expanded out to the long hand flag. |
**interactive** | `false` | `boolean` | If set to false the flag will omitted from interactive prompts
**default**    | `false` | `mixed` | A value to return if the flag is omitted. |
**mask**       | `false` | `boolean` | **interactive mode only** Sets the input type to masked input to hide values
**choices**    | `false` | `array` | Used only during an interactive command. Restricts the users options only to the options **specified** |
**multi**      | `false` | `boolean` | **interactive mode only** If choices is specified, and multi is true, this user will be presented a multi checkbox UI allowing them to pick multiple values. The return value will be an array
**skip**       | `false` | `boolean` | **interactive mode only** - if set to `true` this flag will be omitted from the interactive command prompts |
**event**      | `false` | `boolean` | if set to `true` the command will emit an event withe the same name as the flag with **the** value that was captured for that flag |
**when** | `false` | `function` | **interactive mode only** Receives the current user answers hash and should return true or **false** depending on whether or not this question should be asked.
**validate** | `false` | `function` |  receives user input and should return true if the value is **valid**, and an error message (String) otherwise. If false is returned, a default error message is provided.
**filter** | `false` | `function` | **interactive mode only** Receives the user input and return the filtered value to be used **inside** the program. The value returned will be added to the Answers hash.

### Types

Generally, all input from `stdin` is represented as strings. Using the flag `type` option you can specify
The data expected data type and the input value will be coerced appropriately.
In most cases, you may pass the native javascript type you want to use. There are special cases
for `url` and `path`

#### String

Coerce all values as text / strings

#### Number

Coerce all values as numeric ( integer or decimal )

#### Date

Converts javascript date string into full Date objects

#### Boolean

Boolean is a special input type in that it doesn't require an input value. The presence of the flag indicates a true value.
The flag can be negated by prefixing the flag with `no-`

```javascript
new Command({
  flags: {
    bool: {
      type: Boolean
    }
  }
})
```

```sh
$ cmd --bool #true
$ cmd --no-bool #false
```

#### URL

A valid URL string. If it can't be parsed or is not a value url, An error will be raised.
The flag type should be the node `url` module

```javascript
const url = require('url')

new Command({
  flags: {
    website: {
      type: url
    }
  }
})
```


#### Path

A valid file system path. If the path doesn't resolve, an error will be raised.

```javascript
const path = require('path')

new Command({
  flags: {
    file: {
      type: path
    }
  }
})
```

#### Password

Collects values as strings, but does not display the input value when it is typed.
This is accomplished by setting flag property, `mask` to `true`. This only pertains to
interactive mode with the user is prompted for a password. Input flags cannot be masked


```javascript
const path = require('path')

new Command({
  flags: {
    passowrd: {
      type: String
    , mask: true
    }
  }
})
```

#### Array

Including `Array` in combination with another type allows a particular flag to be repeated.
The resulting input value will always be an array

```javascript
new Command({
  flags: {
    numbers: {
      type: [Number, Array]
    }
  }
})
```

```sh
$ cmd --numbers=1 --numbers=2 --numbers=3
# {numbers: [1, 2, 3]}
```

### Nested Flags

Nested flags are a way to better control the shape of the input object that is
collected before the `run` function is executed. Nested flags make use of a separator (`:`)
to drill down into the final `data` object

```javascript
new Command({
  flags: {
    'deep:property': {
      type: String
    }
  }
})
```

```sh
$ cmd --deep:property=hello
# {deep: {property: 'hello'}}
```

## Sub Commands

Commands can be nested allowing the construction of a more fluent
user experience. A command accepts an additional `commands` array
property. Each command is stand alone and can define its own input flags
and execution behaviors

<<< @/gh-pages/examples/commands/sub.js{31}

When sub commands are registered the help output is augmented with additional
information about all registered commands. This behavior is recurrsive in that
a command can have 0 or more commands. Seeli itself is a command, which
keeps the execution behavior consistent
