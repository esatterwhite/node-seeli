'use strict'

module.exports = {
  title: 'Seeli'
, dest: 'docs'
, base: '/node-seeli/'
, patterns: [
    '**/*.md'
  , '!node_modules'
  , '!**/node_modules'
  , '!**/examples/node_modules'
  ]
, description: 'The Object orientated, event driven interactive cli framework'
, configureWebpack: {
    resolve: {
      alias: {
        '@alias': '/assets/img'
      }
    }
  }
, themeConfig: {
    logo: '/assets/img/seeli-logo.png',
  }
, plugins: [
    '@vuepress/plugin-back-to-top'
  ]
, head: [
  ]
, themeConfig: {
    sidebar: 'auto'
  , smoothScroll: true
  , nextLinks: true
  , prevLinks: true
  , nav: [
      { text: 'Github', link: 'https://github.com/esatterwhite/node-seeli', target:'_self', rel:'' }
    , { text: 'Getting Started', link: '/getting-started' }
    , { text: 'Guides'
      , items: [
          { text: 'Commands', link: '/guides/commands' }
        , { text: 'Progress UI', link: '/guides/ui' }
        , { text: 'Interactive Commands', link: '/guides/interactive' }
        , { text: 'Plugins', link: '/guides/plugins' }
        ]
      }
    , { text: 'Changelog', link: '/changelog', target:'_self' }
    ]
  }
}

