var util = require('util')
var Help = require('./help')
var combine = require('mout/array/combine')
var registry =  { 
}
  , abbrev = require("abbrev")
  , os = require("os")

Object.defineProperties(registry,{

	register:{
		enumerable: false
		,value: function( name, cmd ){
			var abbrevs = abbrev( name )
			var alias = [];

			if( cmd.alias ){
				if( Array.isArray( cmd.alias ) ){
					combine( abbrevs, cmd.alias )
				} else{
					abbrevs.push( cmd.alias.toString() )
				}
			} 
			// each command will emit a content event
			// when it has processed it's final
			cmd.on('content', function( content ){
				process.stdout.write( content )
				process.stdout.write( os.EOL )
				
				if( this._exit ){
					process.exit(0);
				}

			});

			// generate short hand commands
			// that are accessable but not enumerable.
			// really just for typo support.
			Object.keys( abbrevs ).forEach( function( c ){

				if( !registry.hasOwnProperty( c ) ){
					Object.defineProperty( registry, c, {
						enumerable:c == name ? true : false
						,configurable:true
						,get: function(){
							return cmd;
						}

					})
				} 
			})
		}
	}

	,exitOnContent: {
		enumerable: false
		,get: function(){
			return !!this._exit;
		}

		,set: function( exit ){
			this._exit = !!exit;
			return this;
		}
	}

	,list: {
		enumerable:false
		,get:function(){
			return Object.keys( registry )
		}
	}

	,reset: {
		enumerable: false
		,value: function(){
			for(var key in registry ){
				this.unregister( key );
			}
			return this;
		}
	}

})

registry.register('help', Help)
module.exports = registry
