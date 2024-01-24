/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { yaml, deleteFiles } = require('mrm-core')
const mergeConfig = require('../utils/mergeConfig')

function task (config) {
  mergeConfig(config, {
    services: [],
    minNodeVersion: '17.0.0'
  })

  const appveyor = config.services.indexOf('appveyor') > -1

  /**
   * Remove `appveyor.yml` file when `appveyor` is missing inside
   * services array.
   */
  if (!appveyor) {
    deleteFiles(['appveyor.yml'])
    return
  }

  const appveyorFile = yaml('appveyor.yml')
    .set('environment.matrix', [{ nodejs_version: 'Stable' }, { nodejs_version: config.minNodeVersion }])
    .set('init', 'git config --global core.autocrlf true')
    .set('install', [{ ps: 'Install-Product node $env:nodejs_version' }, 'npm install'])
    .set('test_script', ['node --version', 'npm --version', 'npm run test'])
    .set('build', 'off')
    .set('clone_depth', 1)
    .set('matrix.fast_finish', true)

  appveyorFile.save()
}

task.description = 'Adds appveyor.yml file'
module.exports = task
