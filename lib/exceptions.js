/*jshint laxcomma: true, smarttabs: true, node: true*/
'use strict';
/**
 * Default exception types for seeli
 * @module seeli/lib/exceptions
 * @author Eric Satterwhite
 * @since 0.0.1
 */

/**
 * @class module:seeli/lib/exceptions.RequiredFieldError
 * @param {String} field Name of the field that was required
 * @extends Error
 */
class RequiredFieldError extends Error {
  constructor( field ){
  super();

  /**
   * @readonly
   * @instance
   * @memberof module:seeli/lib/exceptions.RequiredFieldError
   * @name name
   * @property {String} name=RequiredFieldError Exception name
   **/
  this.name = 'RequiredFieldError'
  /**
   * @readonly
   * @instance
   * @memberof module:seeli/lib/exceptions.RequiredFieldError
   * @name message
   * @property {String} message Message to include in error output
   **/
  this.message = `${field} is a required option`
  }

}


class InvalidFieldException extends RequiredFieldError {
  constructor( msg ){
  super();
  this.message = msg;
  this.name = 'InvalidFieldEception';
  }
}
exports.RequiredFieldError = RequiredFieldError
exports.InvalidFieldException = InvalidFieldException
