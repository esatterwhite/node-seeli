'use strict'

const config = require('@codedependant/release-config-npm')

module.exports = {
  'extends': '@codedependant/release-config-npm'
, 'branches': ['main']
, 'plugins': remap(config.plugins)
}

function remap(plugins) {
  const remapped = []

  for (const [name, config] of plugins) {
    if (name === '@semantic-release/git') {
      remapped.push([
        '@semantic-release/exec', {
          prepareCmd: 'npm run docs:build'
        }
      ])
      config.assets = [...config.assets, 'docs']
    }

    remapped.push([name, config])
  }

  return remapped

}
