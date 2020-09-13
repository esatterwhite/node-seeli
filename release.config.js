'use strict'

module.exports = {
  branches: [
    'master'
  ]
, plugins: [
    ['@semantic-release/commit-analyzer', {
      parserOpts: {
        noteKeywords: ['BREAKING', 'BREAKING CHANGE', 'BREAKING CHANGES']
      , referenceActions: [
          'close', 'closes', 'closed'
        , 'fix', 'fixes', 'fixed'
        , 'resolve', 'resolves', 'resolved'
        ]
      }
    , releaseRules: [
        {type: 'build', release: 'patch'}
      , {type: 'ci', release: 'patch'}
      , {type: 'release', release: 'patch'}
      , {type: 'chore', release: 'patch'}
      , {type: 'refactor', release: 'patch'}
      , {type: 'test', release: 'patch'}
      , {type: 'doc', release: 'patch'}
      , {type: 'lib', release: 'patch'}
      ]
    }],
  , ['@semantic-release/release-notes-generator', null]
  , ['@semantic-release/changelog', {
      changelogTitle: '# Changlog'
    , changelogFile: 'CHANGELOG.md'
    }]
  , ['@semantic-release/npm', null]
  , ['@semantic-release/git', {
      assets: [
        'package.json'
      , 'package-lock.json'
      , 'CHANGELOG.md'
      ]
    }]
  , ['@semantic-release/github', null]
  ]
}
