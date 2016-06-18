/*jshint laxcomma:true, smarttabs: true */
/**
 * Interanl module for parsing options from command instances
 * @module module:lib/helpers/argv
 * @author Eric Satterwhite
 * @requires os
 * @requires util
 * @requires chalk
 **/
var os    = require('os')     // node os module
  , util  = require('util')   // node util module
  , path = require("path")
  , url = require('url')
  , chalk = require('chalk')  // npm chalk module for ansi terminal colors
  , kindOf = require('mout/lang/kindOf')
  , isFunction = require('mout/lang/isFunction')
  , conf  = require('../conf')
  , usage   = chalk.white.bold

// displays the type of thing we expect
// given a possible set of types, return
// the best string representation.

exports.type = function( thing ){
	if( thing == path ){
		return "path"
	} else if ( thing == url ){
		return 'url'
	} else if( typeof thing === 'number' && isNaN( thing )){
		return 'NaN'
	} else if( Array.isArray( thing ) ){
		return exports.type( thing[0] ) + "*"
	} else if (isFunction( thing )) {
		return kindOf(thing()).toLowerCase();
	} else {
		return kindOf( thing )
	}
}


exports.list = function(){
	var commands = require("../commands");
	var color = chalk[ conf.get('color') ] || noop;
	try{
		var content = [
			usage("Usage: ") + " " + util.format("%s <%s> [options]", conf.get("name"), color( "command" ) ),
			"",
			"Where <command> is the name the command to execute.",
			util.format("%s" , Object.keys( commands  ).map(function( name ){
				return usage("* ") + color( name ) + " - " + commands[name].description;
			}).join(os.EOL) )

		].join(os.EOL);

		return content;
	} catch( e ){
		return util.format("CLI error:".red, e.message  );
	}
}

exports.usage = {
	from: function( flags, plain ){
		var return_value // the value we are going to return 
		  , style;      // color style to apply

		return_value = [];
		style = !!plain ? function(input){ return input } : chalk[conf.get('color')] || chalk.green;

		Object.keys(flags).forEach(function( flag ){
			var config = flags[ flag ]
			var type = exports.type( config.type );
			return_value.push(util.format(
				"  %s --%s%s <%s> %s %s"
				, config.shorthand ? "-" +config.shorthand +',' : ""
				, flag
				, type === 'boolean' ? ", --no-" + flag :''
				, style(type)
				, typeof config.default === 'undefined' ? "" : util.format("[%s]", chalk.bold( config.default ) )
				,config.description || ''
			))
		})

		return return_value.join( os.EOL + "  " );
	}
}

