/*jshint node: true, laxcomma: true */
'use strict';

var os = require('os')
  , path = require('path')
  , set = require('mout/object/set')
  , get = require('mout/object/get')
  , chalk = require('chalk')
  , isObject = require('mout/lang/isPlainObject')
  , defaults
  , filename = process.argv[1]
  ;

let username = 'seeli'
let host = 'local'
try {
  const info = os.userInfo()
  host = os.hostname()
  username = info.username
} catch (_) {}

const PS1 = `${username}@${host}`
const name = filename ? path.basename(filename, '.js') : 'seeli'

defaults = {
  color:'green'
, prompt: `[${chalk.green(PS1)} ${chalk.bold(name)}]$ `
, name: name
, help: path.resolve(path.join( __dirname, 'commands', 'help') )
, exitOnError: true
, exitOnContent: true
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
