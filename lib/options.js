/*jshint laxcomma:true, smarttabs: true */
'use strict';
/**
 * @module seeli/lib/options
 * @author Eric Satterwhite
 * @requires prime
 * @requires mout/object/merge
 * @requires mout/array/append
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
	 * merges passing in object as configuration overrides
	 * @param {Object} [options] Configuration overrides to set
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
 * Utility mixin class to provide unified configuration handling 
 * @constructor
 * @alias module:seeli/lib/options
 */
module.exports = Options
