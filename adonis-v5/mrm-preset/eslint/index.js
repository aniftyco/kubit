/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { json, install, packageJson, lines } = require('mrm-core')

function task () {
  /**
   * Delete old eslintrc files
   */
  const eslintRc = json('.eslintrc.json')
  const eslintIgnore = lines('.eslintignore')
  eslintRc.delete()
  eslintIgnore.delete()

  /**
   * Update package file
   */
  const pkgFile = packageJson()
  pkgFile.setScript('lint', 'eslint . --ext=.ts')
  pkgFile.set('eslintConfig', {
    extends: ['plugin:adonis/typescriptPackage']
  })
  pkgFile.set('eslintIgnore', ['build'])
  pkgFile.save()

  /**
   * Install required dependencies
   */
  install(['eslint', 'eslint-plugin-adonis'])
}

task.description = 'Adds eslint to the project'
module.exports = task
