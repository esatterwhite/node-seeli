/* jshint laxcomma: true, smarttabs: true, node: true, esnext: true*/
'use strict'
/**
 * Default exception types for seeli
 * @module seeli/lib/exceptions
 * @author Eric Satterwhite
 * @since 0.0.1
 */

/**
 * @class module:seeli/lib/exceptions.RequiredFieldException
 * @param {String} field Name of the field that was required
 * @extends Error
 */
class RequiredFieldException extends Error {
  constructor(field) {
    super()

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.RequiredFieldException
     * @name name
     * @property {String} name=RequiredFieldException Exception name
     **/
    this.name = 'RequiredFieldException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.RequiredFieldException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `${field} is a required option`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.RequiredFieldException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EREQUIRED'
  }

}

/**
 * @class module:seeli/lib/exceptions.InvalidFieldException
 * @param {String} msg the message for the error
 * @extends Error
 */
class InvalidFieldException extends RequiredFieldException {
  constructor(msg) {
    super()

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.InvalidFieldException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = msg

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.InvalidFieldException
     * @name name
     * @property {String} name=InvalidFieldException Exception name
     **/
    this.name = 'InvalidFieldEception'

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.InvalidFieldException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EINVALIDFIELD'
  }
}

/**
 * @class module:seeli/lib/exceptions.UnknownFlagException
 * @param {String} field Name of the erroneous flag
 * @extends Error
 */
class UnknownFlagException extends Error {
  constructor(field) {
    super()

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.UnknownFlagException
     * @name name
     * @property {String} name=RequiredFieldException Exception name
     **/
    this.name = 'UnknownFlagException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.UnknownFlagException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `unknow field: ${field}.`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.UnkownFlagException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'ENOFLAG'
  }
}

class CommandException extends Error {
  constructor(msg) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.CommandException
     * @name name
     * @property {String} name=CommandException Exception name
     **/
    this.name = 'CommandException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.CommandException
     * @name name
     * @property {String} name=CommandException Exception name
     **/
    this.message = msg
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.CommandException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'ECOMMAND'
  }
}

module.exports = {
  RequiredFieldException: RequiredFieldException
, InvalidFieldException: InvalidFieldException
, UnknownFlagException: UnknownFlagException
, CommandException: CommandException
}
