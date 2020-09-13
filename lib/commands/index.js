/* jshint laxcomma: true, smarttabs: true, node: true, unused: true*/
'use strict'
/**
 * Command registry for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires seeli/conf
 * @requires seeli/lib/registry
 */

const Registry = require('../registry')
const conf = require('../conf')

module.exports = new Registry()
module.exports.register('help', require(conf.get('help')))
