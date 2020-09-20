'use strict'

const now = new Date()
const year = now.getFullYear()
const day = String(now.getDate()).padStart(2, '0')
const month = String(now.getMonth() + 1).padStart(2, '0')

const COMMIT_TYPES = new Map([
  ['build', 'Build System']
, ['ci', 'Continuous Integration']
, ['chore', 'Chores']
, ['default', 'Miscellaneous']
, ['dep', 'Dependancies']
, ['doc', 'Documentation']
, ['docs', 'Documentation']
, ['feat', 'Features']
, ['fix', 'Bug Fixes']
, ['lint', 'Lint']
, ['perf', 'Performance Improvements']
, ['revert', 'Reverts']
, ['refactor', 'Code Refactoring']
, ['style', 'Style']
, ['test', 'Tests']
])

function typeOf(type) {
  return COMMIT_TYPES.get(type) || COMMIT_TYPES.get('default')
}

function transform(commit) {
  commit.type = typeOf(commit.type)
  commit.shortHash = commit.hash.substring(0, 7)
  return commit
}

module.exports = {
  branches: [
    'main'
  ]
, parserOpts: {
    noteKeywords: ['BREAKING', 'BREAKING CHANGE', 'BREAKING CHANGES']
  , headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/
  , breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/
  , headerCorrespondence: ['type', 'scope', 'subject']
  , issuePrefixes: ['#', 'gh-']
  , referenceActions: [
      'close', 'closes', 'closed'
    , 'fix', 'fixes', 'fixed'
    , 'resolve', 'resolves', 'resolved'
    ]
  }
, writerOpts: {transform: transform}
, releaseRules: [
    {breaking: true, release: 'major'}
  , {revert: true, release: 'patch'}
  , {type: 'build', release: 'patch'}
  , {type: 'ci', release: 'patch'}
  , {type: 'release', release: 'patch'}
  , {type: 'doc', release: 'patch'}
  , {type: 'chore', release: 'patch'}
  , {type: 'ci', release: 'patch'}
  , {type: 'lib', release: 'patch'}
  , {type: 'perf', release: 'minor'}
  , {type: 'refactor', release: 'patch'}
  , {type: 'release', release: false}
  , {type: 'test', release: 'patch'}
  , {type: 'fix', release: 'patch'}
  ]
, plugins: [
    ['@semantic-release/commit-analyzer', null],
  , ['@semantic-release/release-notes-generator', null]
  , ['@semantic-release/changelog', {
      changelogTitle: '# Changlog'
    , changelogFile: 'CHANGELOG.md'
    }]
  , ['@semantic-release/npm', null]
  , ['@semantic-release/exec', {
      publishCmd: 'npm run docs:build'
    }]
  , ['@semantic-release/git', {
      assets: ['package.json', 'package-lock.json', 'CHANGELOG.md', 'docs']
    , message: `release: ${year}-${month}-${day}, `
        + 'Version <%= nextRelease.version %> [skip ci]'
    }]
  , ['@semantic-release/github', null]
  ]
}
