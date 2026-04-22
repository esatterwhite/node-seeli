---
prev: ./interactive
next: false
---
# Plugins

Seeli provides basic support for plugins as a means to share commands
and other common bits of functionality. Plugins are javascript functions
that will be called during initialization of the command line interface.
When called, the plugin will be passed the current seeli instance which gives you access to configuration and the ability to register additional commands

```javascript
'use strict'
const BasicCommand = require('./commands/basic')

module.exports = simplePlugin

function simplePlugin(seeli) {
  seeli.config('color', 'magenta')
  seeli.use(BasicCommand)
}
```

## Autoloading

When seeli is initialized it will pull plugins from the `plugins` array loaded
from configuration. The plugins array can contains `functions`, or `strings`.
If a string is found, it is treated as a module id and loaded via `require`. The
module should expose a single function as described above.

The easiest way to load plugins is to define an array of plugins in `package.json`

```json
{
  "seeli": {
    "plugins": [
      "basic-command",
      "common-settings"
    ]
  }
}
```

## Manual Loading

Alternatively, plugins can be loaded manually using the `plugin` function.
The `plugin` function accepts a variable number of plugins.

```javascript
'use strict'

const seeli = require('seeli')

seeli.plugin(
  '@myscope/base-config'
, require('./lib/another-plugin')
)
```
