/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { join } = require('path')
const { chmodSync } = require('fs')
const { execSync } = require('child_process')
const { packageJson, install, template, lines } = require('mrm-core')

const prTemplate = '.github/COMMIT_CONVENTION.md'

function task () {
  const pkgFile = packageJson()

  /**
   * Below is the script for interactively creating a commit
   */
  pkgFile.setScript('commit', 'git-cz')
  pkgFile.set('config.commitizen.path', 'cz-conventional-changelog')

  /**
   * Save the package file
   */
  pkgFile.save()

  /**
   * Install required dependencies
   */
  install(['cz-conventional-changelog', 'commitizen', 'husky'])

  /**
   * Setup husky
   */
  execSync('npx husky install')

  /**
   * Create commit-msg file
   */
  const commitFile = lines('.husky/commit-msg')
    .add('#!/bin/sh')
    .add('. "$(dirname "$0")/_/husky.sh"')
    .add('HUSKY_GIT_PARAMS=$1 node ./node_modules/@adonisjs/mrm-preset/validate-commit/conventional/validate.js')

  const fileAlreadyExists = commitFile.exists()
  commitFile.save()

  /**
   * Change mode when file not already exists
   */
  if (!fileAlreadyExists) {
    chmodSync(join(process.cwd(), '.husky/commit-msg'), 0o0755)
  }

  /**
   * Remove old husky hooks block
   */
  pkgFile.unset(
    'husky.hooks.commit-msg',
    'node ./node_modules/@adonisjs/mrm-preset/validateCommit/conventional/validate.js'
  )

  /**
   * Copy commit convention template
   */
  template(prTemplate, join(__dirname, 'conventional', 'template.md')).apply({}).save()
}

task.description = 'Enforces commit message convention'
module.exports = task
