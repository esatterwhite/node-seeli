---
prev: ./commands
next: ./interactive
---
# UI

As your commands become more complex and do more things, the need to communicate what is happening
to users becomes increasingly important. Seeli provides a few simple and powerful ways
to interact and communicate with users.

## Progress Indicators

Seeli commands have access to an instance of [ora][] inside the `run` function.
It can be controlled by the `ui` property. Additionally, you may use `ui` configuration
property to change the progress spinner to any valid ora spinner.

<<< @/gh-pages/examples/commands/progress.js{13}

![progress](../assets/img/guides/ui-progress.gif)

**All available spinners**
![spinners](../assets/img/guides/ui-spinners.gif)


## Messages

By assigning a string to the `text` property of the **ui** instance
you are able to set the text of the terminal in place. This is useful for
updating users of the current status. For example, you may want to
display the number of steps that have been completed by the current command.


<<< @/gh-pages/examples/commands/messages.js{41}
![messages](../assets/img/guides/ui-messages.gif)

## Alerts

When you need to display important messages, like a command failing or
prematurely stopping, you should use the alert functions. each function has
a unique icon for the severity of the message. The functions available on the
`ui` object are:

* **info**
* **warn**
* **fail**
* **succeed**

<<< @/gh-pages/examples/commands/alerts.js
![alerts](../assets/img/guides/ui-alerts.gif)

::: tip
When you use one of the alery function, the progress indicator will be stopped.
You must call `this.ui.start(...)` again to restart it
:::

## Prompts

Seeli uses the [inquirer][] to interactively collect input
from users. This functionality is exposed via the `prompt` function.
This is a direct passthrough the the inquirer function of the [same name](https://www.npmjs.com/package/inquirer#inquirerpromptquestions---promise).
This makes things like conditional and branching logic based on user input
significantly easier.

<<< @/gh-pages/examples/commands/prompts.js{15-19}
![prompts](../assets/img/guides/ui-prompts.gif)


[inquirer]: https://www.npmjs.com/package/inquirer
[ora]: https://www.npmjs.com/package/ora
