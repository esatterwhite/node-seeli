/* jshint laxcomma: true, smarttabs: true, node: true, esnext: true*/
'use strict'

/**
 * Module for generate command usage test
 * @author Eric Satterwhite
 * @module seeli/lib/usage
 * @since 7.0.0
 * @requires seeli/lib/usage/from
 * @requires seeli/lib/usage/list
 * @requires seeli/lib/usage/type-of
 **/

module.exports = {
  /**
   * @memberof module:seeli/lib/usage
   * @property {function} from
   * @see module:seel/lib/usage/from
   **/
  from: require('./from')
  /**
   * @memberof module:seeli/lib/usage
   * @property {function} list
   * @see module:seel/lib/usage/list
   **/
, list: require('./list')
  /**
   * @memberof module:seeli/lib/usage
   * @property {function} typeOf
   * @see module:seel/lib/usage/type-of
   **/
, typeOf: require('./type-of')
}
