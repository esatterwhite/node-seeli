// ESM shim for node-seeli
// CommonJS users: const seeli = require('seeli')
// ESM users: import seeli from 'seeli'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const seeli = require('./index.js')

export default seeli
export const { Seeli, Command, list } = seeli
export const {
  red, blue, green, yellow, bold, grey,
  dim, black, magenta, cyan,
  redBright, blueBright, greenBright, yellowBright, cyanBright
} = seeli
