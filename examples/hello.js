'use strict'
const cli = require('../')

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

  , password: {
      type:String
    , mask:true
    , description:"unique password"
    , shorthand:'p'
    , required: false
    }
  }
, run: async function( cmd, data ){
    const ui = this.ui
    ui.start()
    var names = Array.isArray( data.name ) ? data.name : [ data.name ]
    for( var x = 0; x< names.length; x++ ){
      await new Promise((resolve) => {
        setTimeout(() => {
          let value = "Hello, " + names[x]
          if( data.excited ){
            value += '!'
          }

          ui.text = ( data.volume === 'screaming' ? value.toUpperCase() : value );
          resolve(true)
        }, 1000 * x)
      })
    }
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.password) {
          ui.succeed('your password was set')
        } else {
          ui.stop()
        }
      }, 1000 * (names.length + 1))
    })

    return out
  }
});
