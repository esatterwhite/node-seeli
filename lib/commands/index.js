'use strict'
/**
 * Command registry for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires seeli/conf
 * @requires seeli/lib/seeli
 */

const help = require('./help')
const Seeli = require('../seeli')
const instance = new Seeli()

instance.use(help)
module.exports = instance
