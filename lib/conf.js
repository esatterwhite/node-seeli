/*jshint node: true, laxcomma: true */
'use strict';

var set = require('mout/object/set')
  , get = require('mout/object/get')
  , isObject = require('mout/lang/isPlainObject')
  , defaults
  , path = require('path')
  ;

defaults = {
	color:'green',
	name: path.basename(process.argv[1], '.js') || 'seeli',
	help: path.resolve(path.join( __dirname, 'commands', 'help') )
};

exports.get = function( key ){
	return get( defaults, key );
};

exports.set = function( key, value ){
	if( isObject( key ) ){
		for( var k in key ){
			set( defaults, k, key[ k ] );	
		}
		return;
	}

	return set( defaults, key, value );
};
