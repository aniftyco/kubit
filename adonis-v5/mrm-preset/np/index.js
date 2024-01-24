/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { install, packageJson, ini } = require('mrm-core')

function task () {
  /**
   * Install required dev-dependencies
   */
  install(['np'])

  const pkgFile = packageJson()

  /**
   * Set npm config
   */
  pkgFile.set('np', {
    contents: '.',
    anyBranch: false
  })

  /**
   * Set release script
   */
  pkgFile.setScript('release', 'np --message="chore(release): %s"')
  pkgFile.setScript('version', 'npm run build')

  /**
   * Save the package file
   */
  pkgFile.save()

  /**
   * Remove old npmrc file
   */
  const npmrc = ini('.npmrc')
  npmrc.delete()
}

task.description = 'Adds np to do release management'
module.exports = task
