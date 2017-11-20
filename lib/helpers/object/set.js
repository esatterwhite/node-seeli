/*jshint laxcomma:true, smarttabs: true, node: true, esnext: true, unused: true */
'use strict';

/**
 * Helper function settign nested properties on an object
 * @module seeli/lib/helpers/object/set
 * @author Eric Satterwhite
 * @requires seeli/lib/helpers/object/path-exp
 * @example
 * set({}, 'foo:bar:baz', 12)
 * { foo: { bar : { baz: 12 } } }
 **/

const PATH_REGEX = require('./path-exp')

module.exports = setProperty

function setProperty(obj, key, value, sep = ':') {
  const parts = PATH_REGEX.exec(key);
  if (parts) {
    _namespace(obj, parts[1], sep)[parts[2]] = value;
  } else {
    obj[key] = value;
  }
  return obj;
}

function _namespace(obj, path, sep = ':') {
  if (!path) return obj;
  const keys = path.split(sep)
  for( const key of keys ) {
    if (!obj[key]) {
      obj[key] = Object.create(null);
    }
    obj = obj[key];
  };
  return obj;
}
