var util  = require('util')

function RequiredFieldError( field ){
	this.name = 'RequiredFieldError'
	this.message = util.format( '%s is required', field)
};
RequiredFieldError.prototype = new Error();


exports.RequiredFieldError = RequiredFieldError 
