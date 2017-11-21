'use strict'

/**
 * Object helpers
 * @author Eric Satterwhite
 * @since 6.0.0
 * @module seeli/lib/helpers/object
 * @requires seeli/lib/helpers/object/set
 * @requires seeli/lib/helpers/object/key-for
 **/

module.exports = {
  /**
   * @property set {Function} sets a deep property on an object
   * @type Function
   * @memberof module:seeli/lib/helpers/object
   * @see module:seeli/lib/helpers/object/set
   **/
  set: require('./set')
  /**
   * @property key-for {Function} Identifies the top level key of a nested path
   * @type Function
   * @memberof module:seeli/lib/helpers/object
   * @see module:seeli/lib/helpers/object/key-for
   **/
, keyFor: require('./key-for')
}
