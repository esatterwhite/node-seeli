/*jshint laxcomma:true, smarttabs: true, node: true, esnext: true, unused: true */
'use strict';

/**
 * Returns the top leve key of a nested object key property
 * @module seeli/lib/helpers/object/key-for
 * @author Eric Satterwhite
 * @requires seeli/lib/helpers/object/path-exp
 * @exports Function
 * @example
 * keyFor('foo:bar:baz')
 * // foo
 **/

const exp = require('./path-exp')

module.exports = keyFor

function keyFor(path) {
  const bits = exp.exec(path)
  return bits ? bits[0] : path
}
