
var registry =  { 
	help:require('./help')
}
  , abbrev = require("abbrev")
  , os = require("os")

Object.defineProperties(registry,{

	register:{
		enumerable: false
		,value: function( name, cmd ){
			// each command will emit a content event
			// when it has processed it's final
			cmd.on('content', function( content ){
				process.stdout.write( content )
				process.stdout.write( os.EOL )
				process.exit(0)
			});

			// expose the command by name
			registry[ name ] = cmd;

			// generate short hand commands
			// that are accessable but not enumerable.
			// really just for typo support.
			var abbrevs = abbrev( name )
			Object.keys( abbrevs ).forEach( function( c ){

				if( !registry.hasOwnProperty( c ) ){
					Object.defineProperty( registry, c, {
						enumerable:false
						,get: function(){
							return cmd;
						}
					})
				}
			})
		}
	}

	,list: {
		enumerable:false
		,get:function(){
			return Object.keys( registry )
		}
	}


})


module.exports = registry
