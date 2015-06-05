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
var Prime = require('prime')
var RequiredFieldError;
var InvalidFieldException
/**
 * @class module:seeli/lib/exceptions.RequiredFieldError
 * @param {String} field Name of the field that was required
 * @extends Error
 */
RequiredFieldError = new Prime({
	inherits:Error,
	constructor: function( field ){
		Error.call( this );

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
		this.message = util.format( '%s is a required option', field)

	}

});

Object.defineProperties(RequiredFieldError.prototype,{
	stack: {
		get: function(){
			var e = new Error();
			e.message = this.message;
			e.name = this.name;
			return e.stack;
		}
	}
});

InvalidFieldException = new Prime({
	inherits:RequiredFieldError,
	constructor: function( msg ){
		Error.call( this );

		this.message = msg;
		this.name = 'InvalidFieldEception';
	}
});
exports.RequiredFieldError = RequiredFieldError 
exports.InvalidFieldException = InvalidFieldException 
