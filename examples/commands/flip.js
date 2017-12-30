'use strict'

const cli = require('../../')
const CHARS = {
  // uppercase (incomplete)
  'A':'∀',
  'B':'𐐒',
  'C':'Ɔ',
  'E':'Ǝ',
  'F':'Ⅎ',
  'G':'פ',
  'H':'H',
  'I':'I',
  'J':'ſ',
  'L':'˥',
  'M':'W',
  'N':'N',
  'P':'Ԁ',
  'R':'ᴚ',
  'T':'⊥',
  'U':'∩',
  'V':'Λ',
  'Y':'⅄',

  // lowercase
  'a':'ɐ',
  'b':'q',
  'c':'ɔ',
  'd':'p',
  'e':'ǝ',
  'f':'ɟ',
  'g':'ƃ',
  'h':'ɥ',
  'i':'ᴉ',
  'j':'ɾ',
  'k':'ʞ',
  'm':'ɯ',
  'n':'u',
  'p':'d',
  'q':'b',
  'r':'ɹ',
  't':'ʇ',
  'u':'n',
  'v':'ʌ',
  'w':'ʍ',
  'y':'ʎ',

  // numbers
  '1':'Ɩ',
  '2':'ᄅ',
  '3':'Ɛ',
  '4':'ㄣ',
  '5':'ϛ',
  '6':'9',
  '7':'ㄥ',
  '8':'8',
  '9':'6',
  '0':'0',

  // special chars
  '.':'˙',
  ',':'\'',
  '\'':',',
  '"':',,',
  '`':',',
  '<':'>',
  '>':'<',
  '∴':'∵',
  '&':'⅋',
  '_':'‾',
  '?':'¿',
  '!':'¡',
  '[':']',
  ']':'[',
  '(':')',
  ')':'(',
  '{':'}',
  '}':'{'
}

Object.keys(CHARS).forEach(function (key) {
  var value = CHARS[key]
  if(!CHARS[value]) {
    CHARS[value] = key
  }
})

module.exports = new cli.Command({
  interactive: false
, description: 'flips text upside-down'
, usage: [
    `${cli.get('name')} flip <${cli.colorize('word')}>`
  , `${cli.get('name')} flip ${cli.colorize('test')}`
  , `${cli.get('name')} flip ${cli.colorize('Hello World!')}`
  ]
, run: async function(word) {
    if (!word) return
    var result = ''
      , c = word.length
      , ch = ''
    for (; c >= 0; --c) {
      ch = word.charAt(c)
      result += CHARS[ch] || CHARS[ch.toLowerCase()] || ch
    }
    return result
  }
})
