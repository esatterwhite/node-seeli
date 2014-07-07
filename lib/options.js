/*jshint laxcomma:true, smarttabs: true */
'use strict';
/**
 * DESCRIPTION
 * @module NAME
 * @author 
 * @requires moduleA
 * @requires moduleB
 * @requires moduleC
 **/
var Prime = require('prime')
  , merge = require( 'mout/object/merge' )
  , append = require( 'mout/array/append' )

function removeOn( name ){
	return name.replace(/^on([A-Z])/, function(full, first ){
		return first.toLowerCase();
	})
}


function Options( ){}


Object.defineProperties(Options.prototype,{
	/**
	 * This does something
	 * @param {TYPE} name DESCRPTION
	 * @param {TYPE} name DESCRIPTION
	 * @returns {TYPE} DESCRIPTION
	 */ 
	setOptions: {
		value:function( options ){
			this.options = merge.apply(null, append([{}, this.options], arguments ) );
			options = this.options;
			if( !!this.addListener ){
				for( var opt in options ){

					if( typeof( options[ opt ] ) !== 'function' || !(/^on[A-z]/).test(opt)){
						continue;
					}
					this.addListener( removeOn( opt ), options[ opt ]);
					delete options[opt];
				}
			}
			return this;
		}
		,enumerable:true
		,writeable: true
		,configurable:true
	}
})

/**
 * DESCRIPTION
 * @class module:NAME.Thing
 * @param {TYPE} NAME DESCRIPTION
 * @example var x = new NAME.Thing({});
 */
module.exports = Options
