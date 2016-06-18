/*jshint laxcomma:true, smarttabs: true, node: true */
'use strict';
/**
 * @module seeli/lib/options
 * @author Eric Satterwhite
 * @requires prime
 * @requires mout/object/mixIn
 * @requires mout/array/append
 **/
var mixin = require( 'mout/object/mixIn' )
  , append = require( 'mout/array/append' )
  ;

function removeOn( name ){
	return name.replace(/^on([A-Z])/, function(full, first ){
		return first.toLowerCase();
	});
}


function Options( ){}


Object.defineProperties(Options.prototype,{
	/**
	 * merges passing in object as configuration overrides
	 * @param {Object} [options] Configuration overrides to set
	 */ 
	setOptions: {
		value:function( options ){
			this.options = mixin.apply(null, append([{}, this.options], arguments ) );
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
});

/**
 * Utility mixin class to provide unified configuration handling 
 * @constructor
 * @alias module:seeli/lib/options
 */
module.exports = Options;
