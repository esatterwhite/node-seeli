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
    this.name = 'InvalidFieldException'

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
 * @class module:seeli/lib/exceptions.InvalidChoiceException
 * @param {String} msg the message for the error
 * @extends Error
 */
class InvalidChoiceException extends RequiredFieldException {
  constructor(msg) {
    super()

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.InvalidChoiceException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = msg

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.InvalidChoiceException
     * @name name
     * @property {String} name=InvalidChoiceException Exception name
     **/
    this.name = 'InvalidChoiceException'

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.InvalidChoiceException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EINVALIDCHOICE'
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
    this.message = `unknown field: ${field}.`
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

/**
 * @class module:seeli/lib/exceptions.DuplicateShorthandException
 * @param {String} field Name of the erroneous flag
 * @extends Error
 */
class DuplicateShorthandException extends Error {
  constructor(shorthand, flag, prev) {
    super()

    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.DuplicateShorthandException
     * @name name
     * @property {String} name=DuplicateShorthandException Exception name
     **/
    this.name = 'DuplicateShorthandException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.DuplicateShorthandException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `shorthand ${shorthand} for flag ${flag} `
      + `- duplicates flag ${prev}`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.UnkownFlagException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'ESHORTHAND'
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

class PluginException extends Error {
  constructor(msg) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'PluginException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = msg
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EPLUGIN'
  }
}

class InvalidColorModeException extends Error {
  constructor(msg, modes) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'InvalidColorModeException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `${msg}. Valid color modes: ${modes.join(', ')}`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'ECOLORMODE'
  }
}

class MutuallyInclusiveException extends Error {
  constructor(flag, required_flags, not_set) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'MutuallyInclusiveException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `\`${
      flag
    }\` is mutually inclusive with ${
      required_flags.join(', ')
    }. Not set: ${
      not_set.join(', ')
    }`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EMUTINCLUSIVE'
  }
}

class MutuallyExclusiveException extends Error {
  constructor(flag, must_omit_flags, set_flags) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'MutuallyExclusiveException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `\`${
      flag
    }\` is mutually exclusive with ${
      must_omit_flags.join(', ')
    }. Erroneously set: ${
      set_flags.join(', ')
    }`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EMUTEXCLUSIVE'
  }
}

class RequiresOneExceededException extends Error {
  constructor(requires_one, set_flags) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'RequiresOneExceededException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `Only one of the following flags can be set: ${
      requires_one.join(', ')
    }. Set flags were: ${
      set_flags.join(', ')
    }`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EREQUIRESONEEXCEEDED'
  }
}

class RequiresOneNotSetException extends Error {
  constructor(requires_one) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'RequiresOneNotSetException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = `At least one of the following flags must be set: ${
      requires_one.join(', ')
    }.`
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'EREQUIRESONENOTSET'
  }
}

class ConflictingFlagException extends Error {
  constructor(msg) {
    super()
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name name
     * @property {String} name=PluginException Exception name
     **/
    this.name = 'ConflictingFlagException'
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name message
     * @property {String} message Message to include in error output
     **/
    this.message = msg
    /**
     * @readonly
     * @instance
     * @memberof module:seeli/lib/exceptions.PluginException
     * @name code
     * @property {String} message A Unique error code identifier
     **/
    this.code = 'ECONFLICTINGFLAGOPTIONS'
  }
}

module.exports = {
  RequiredFieldException: RequiredFieldException
, DuplicateShorthandException: DuplicateShorthandException
, InvalidChoiceException: InvalidChoiceException
, InvalidFieldException: InvalidFieldException
, UnknownFlagException: UnknownFlagException
, CommandException: CommandException
, PluginException: PluginException
, InvalidColorModeException: InvalidColorModeException
, MutuallyInclusiveException: MutuallyInclusiveException
, MutuallyExclusiveException: MutuallyExclusiveException
, RequiresOneExceededException: RequiresOneExceededException
, RequiresOneNotSetException: RequiresOneNotSetException
, ConflictingFlagException: ConflictingFlagException
}
