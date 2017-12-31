'use strict'
const os = require('os')
const cli = require('../../')

module.exports = new cli.Command({
  description:"displays a simple hello world command"
, name: 'hello'
, ui: 'dots'
, usage:[
    `${cli.bold("Usage:")} ${cli.get('name')} hello --interactive`
  , `${cli.bold("Usage:")} ${cli.get('name')} hello --name=john`
  , `${cli.bold("Usage:")} ${cli.get('name')} hello --name=john --name=marry --name=paul -v screaming`
  ]

, flags:{

    name:{
      type:[ String, Array ]
    , shorthand:'n'
    , description:"The name of the person to say hello to"
    , required:true
    }

  , 'nested:value' : {
      type: Number
    , shorthand: 'nv'
    , description: 'A newsted Value'
    , name: 'nested'
    }

  , excited: {
      type:Boolean
    , shorthand: 'e'
    , description:"Say hello in a very excited manner"
    , default:false
    }

  , volume:{
      type:String
    , choices:['normal', 'screaming']
    , description:"Will yell at each person"
    , default:'normal'
    , shorthand:'v'
    }
  }
, onContent: (content) => {
    // command success
    // content is the final output from run function
    // non string content is not written to stdout automatically
    // you could do it here

    console.log(content.join(os.EOL))
  }

, run: async function( cmd, data ){
    const out = [];
    this.ui.start('processing names');
    var names = Array.isArray( data.name ) ? data.name : [ data.name ];
    for( var x = 0; x< names.length; x++ ){
      this.ui.text = (`processing ${names[x]}`)
      await new Promise((resolve) => {
        setTimeout(() => {
          let value = "Hello, " + names[x];
          if( data.excited ){
            value += '!';
          }

          out.push( data.volume === 'screaming' ? value.toUpperCase() : value );
          resolve(true);
        }, 1000 * x + 1);
      });
    }

    this.ui.succeed('names processed successfully');

    // anything returned from run
    // is emitted from the `content` event
    // strings will automatically be written to stdout
    return out
  }
});
