/*jshint laxcomma:true, smarttabs: true, node: true */
'use strict';
/**
 * @module seeli/lib/options
 * @author Eric Satterwhite
 * @requires prime
 * @requires mout/object/mixIn
 * @requires mout/array/append
 **/
var append   = require( 'mout/array/append' )
  , hasOwn   = require('mout/object/hasOwn')
  , clone    = require('clone')
  , isObject = require('mout/lang/isObject')
  ;

/**
 * Deep merge objects.
 */
function merge() {
    var i = 1,
        key, val, obj, target;

    // make sure we don't modify source element and it's properties
    // objects are passed by reference
    target = clone( arguments[0] );

    while (obj = arguments[i++]) {
        for (key in obj) {
            if ( ! hasOwn(obj, key) ) {
                continue;
            }

            val = obj[key];

            if ( isObject(val) && isObject(target[key]) ){
                // inception, deep merge objects
                target[key] = merge(target[key], val);
            } else {
                // make sure arrays, regexp, date, objects are cloned
                target[key] = clone(val);
            }

        }
    }

    return target;
}

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
});

/**
 * Utility mixin class to provide unified configuration handling 
 * @constructor
 * @alias module:seeli/lib/options
 */
module.exports = Options;
