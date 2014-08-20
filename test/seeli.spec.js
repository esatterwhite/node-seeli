var assert = require("assert")
var cli    = require("../")
var chalk  = require("chalk")
var os     = require("os")
var path   = require("path")

describe('cli', function(){
	describe('#use', function(){
		var TestCommand = new cli.Command({

		});

		it('should allow commands to be registered by name', function(){
			cli.use('test', TestCommand)
			assert.notEqual( cli.list.indexOf('test'), -1 )

		})

		describe("#list", function(){

		});

	});

	describe('#remove', function(){

	});
})