/*jshint node: true, laxcomma: true */
'use strict';

var set = require('mout/object/set')
  , get = require('mout/object/get')
  , isObject = require('mout/lang/isPlainObject')
  , path = require('path')
  , defaults
  , filename = process.argv[1]
  ;

defaults = {
	color:'green',
	name: filename ? path.basename(filename, '.js') : 'seeli',
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
