/*jshint laxcomma:true, smarttabs: true, node: true, esnext: true, unused: true */
'use strict';

/**
 * Helper function settign nested properties on an object
 * @module seeli/lib/lang/object/set
 * @author Eric Satterwhite
 * @type Function
 * @param {Object} source The source object to set keys on
 * @param {String} key a key path using a colon to separate key levels
 * @param {String|Object} value The value to set at the final key
 * @param {String} [separator=':'] The key separator character
 * @returns {Object} The resulting object
 * @example
 * set({}, 'foo:bar:baz', 12)
 * { foo: { bar : { baz: 12 } } }
 **/


module.exports = setProperty;

function setProperty(obj, key, value, sep = ':') {
  const exp = new RegExp(`^(.+)${sep}(.+)$`);
  const parts = exp.exec(key);
  if (parts) {
    _namespace(obj, parts[1], sep)[parts[2]] = value;
  } else {
    obj[key] = value;
  }
  return obj;
}

function _namespace(obj, path, sep = ':') {
  const keys = path.split(sep);
  for (const key of keys) {
    if (!obj[key]) {
      obj[key] = Object.create(null);
    }
    obj = obj[key];
  }
  return obj;
}
