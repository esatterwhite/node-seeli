/*jshint laxcomma: true, smarttabs: true, node: true*/
'use strict';
/**
 * Default exception types for seeli
 * @module seeli/lib/exceptions
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires util
 */
var util  = require('util')

/**
 * @class module:seeli/lib/exceptions.RequiredFieldError
 * @param {String} field Name of the field that was required
 * @extends Error
 */
function RequiredFieldError( field ){
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
	this.message = util.format( '%s is required', field)
};
RequiredFieldError.prototype = new Error();


exports.RequiredFieldError = RequiredFieldError 
