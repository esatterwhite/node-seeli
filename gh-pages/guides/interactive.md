---
prev: ./commands
next: ./plugins
---

# Interactive Commands

One of the major features of seeli is that commands are inherently interactive.
By default, all commands translate any flags into [inquirer][] prompts.

## Advanced Flag Features

Command flags expose a number of options that allow you to customize the
interactive experience.

### Selective Interactivity

It is possible to disable the built-in interactive behavior by simply setting
the `interactive` option to false when creating a new command

```javascript{7}
'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'sample'
, interactive: false
, description: 'This command disables interactive behavior'
, run: async function() {
    return 'hello world'
  }
})
```

Alternatively, each flag may opt-out of the interactive work flow by setting a similar option


```javascript{12}
'use strict'

const {Command} = require('seeli')

module.exports = new Command({
  name: 'sample'
, interactive: true
, description: 'This command disable interactivity on a single flag'
, flags: {
    foo: {
      type: Boolean
    , interactive: false
    , description: 'Including more foo'
    }
  , bar: {
      type: Boolean
    , description: 'Including more bar'
    }
  }
, run: async function(_, data) {
    return {foo: data.for, bar: data.bar, message: 'hello world'}
  }
})
```

### Input Masking

String flags can make the input being typed to hide sensitive information by
setting the `mask` property to `true`.

<<< @/gh-pages/examples/commands/masking.js{11}

![masking](../assets/img/guides/interactive-masking.gif)

### Choice Lists

Choice lists provide a fixed set of allowable input values forcing users to pick a single value.
The experience is similar in **non-interactive** situations in that passing a value that is not specified
in the choice list will result in an error being thrown.

<<< @/gh-pages/examples/commands/choices.js{13}

![choices](../assets/img/guides/interactive-choices.gif)

### Multi Select

By defining your flag input type as an `Array`, the interactive input will
be presented as a multi-select allowing users to pick multiple values.
The result will be passed to the command as a single array just as it would from
**non-interactive** input.

<<< @/gh-pages/examples/commands/multichoice.js{10,13}

![multiple choice](../assets/img/guides/interactive-multichoice.gif)

## Conditional Flags

There are situations when triggering an input prompt is logically dependent on
the input of a different flag. It is possible to define these dependencies by
specifing a `when` function. This function accepts the accumulated input from
the flags that were defined before it. The when function should return a boolean
value which indicates if the prompt should be presented or not. An added benefit
is that you do need to implement the logic of executing the prompts.

<<< @/gh-pages/examples/commands/conditionals.js{18-20,26-28,34-36}

![conditional](../assets/img/guides/interactive-conditional.gif)

## Dynamic Prompting

For situations when the automatic interactive behavior isn't enough to express
complex logic, you can use the `prompt` to implement any kind of prompting logic.
The Prompt function is a direct pass through to the [inquirer][] prompt function.

<<< @/gh-pages/examples/commands/manual.js{16-24}

![manual prompts](../assets/img/guides/interactive-manual.gif)

[inquirer]: https://www.npmjs.com/package/inquirer
