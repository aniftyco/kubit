/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { install, packageJson } = require('mrm-core')
const gh = require('../utils/ghAttributes')
const mergeConfig = require('../utils/mergeConfig')

function task (config) {
  const ghAttributes = gh('syncing github labels')
  mergeConfig(config, { repo: ghAttributes.repo })

  /**
   * Update package file
   */
  const pkgFile = packageJson()
  pkgFile
    .setScript(
      'sync-labels',
      `github-label-sync --labels ./node_modules/@adonisjs/mrm-preset/gh-labels.json ${config.repo}`
    )
    .save()

  /**
   * Install required dependencies
   */
  install(['github-label-sync'])
}

task.description = 'Adds a script to sync labels with Github'
module.exports = task
