'use strict'

const {defineConfig} = require('eslint/config')
const logdna = require('eslint-config-logdna')

module.exports = defineConfig([
  {
    'extends': [logdna]
  , 'files': ['lib/**/*.js', '*.js', 'test/**/*.js']
  , 'languageOptions': {
      ecmaVersion: 2022
    , sourceType: 'commonjs'
    }
  , 'rules': {
      'sensible/check-require': [2, 'always', {
        root: __dirname
      }]
    , 'logdna/require-file-extension': ['off', false]
    }
  }
])
