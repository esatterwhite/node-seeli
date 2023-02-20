/* istanbul ignore file */
'use strict'
const ora = require('ora')
const colorize = require('./colorize')

const instance = ora()

instance.constructor.prototype.frame = frame

module.exports = ora

function frame() {
  const {frames} = this.spinner
  let frame = frames[this.frameIndex]

  if (this.color) {
    frame = colorize(frame, this.color)
  }

  this.frameIndex = ++this.frameIndex % frames.length
  const fullText = typeof this.text === 'string' ? ' ' + this.text : ''
  const fullPrefixText = (typeof this.prefixText === 'string' && this.prefixText !== '')
    ? this.prefixText + ' '
    : ''

  return fullPrefixText + frame + fullText
}

