import Command = require('./lib/command')
import Seeli = require('./lib/seeli')

declare const seeli: Seeli & {
  Seeli: typeof Seeli
  Command: typeof Command
  list: string[]
  [key: string]: unknown
}

export default seeli
