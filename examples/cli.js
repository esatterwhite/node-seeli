/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
var cli = require('../')

cli.set({
  exitOnError: true
, color: 'green'
, name: 'example'
})

cli.use('hello', require('./hello'));
cli.use('foaas', require('./foaas'));
cli.run();
