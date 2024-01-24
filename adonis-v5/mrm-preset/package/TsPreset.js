/*
* adonis-mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { json, install, uninstall } = require('mrm-core')
const debug = require('debug')('adonis:mrm-package')

class TsPreset {
  constructor () {
    this.dependencies = [
      '@adonisjs/require-ts',
      'typescript',
      '@types/node',
      'del-cli'
    ]
  }

  /**
   * Installing dependencies for a Typescript project
   *
   * @method install
   *
   * @param  {Array} baseDependencies
   *
   * @return {void}
   */
  install (baseDependencies) {
    const dependencies = baseDependencies.concat(this.dependencies)

    debug('installing dependencies %o', dependencies)
    install(dependencies)
  }

  /**
   * Removing dependencies for a Typescript project
   *
   * @method uninstall
   *
   * @return {void}
   */
  uninstall () {
    debug('removing dependencies %o', this.dependencies)
    uninstall(this.dependencies)
  }

  /**
   * Mutating the package file for a typescript project
   *
   * @method up
   *
   * @param  {Object}  pkgFile
   *
   * @return {void}
   */
  up (pkgFile) {
    pkgFile.setScript('clean', 'del-cli build')
    pkgFile.setScript('compile', 'npm run lint && npm run clean && tsc')
    pkgFile.setScript('build', 'npm run compile')
    pkgFile.setScript('prepublishOnly', 'npm run build')

    /**
     * Set files to publish along with the main file
     */
    if (!pkgFile.get('main')) {
      pkgFile.set('main', 'build/index.js')
    }

    if (!pkgFile.get('files')) {
      pkgFile.set('files', [
        'build/src',
        'build/index.d.ts',
        'build/index.js'
      ])
    }

    debug('creating files %o', ['tsconfig.json'])
    json('tsconfig.json').merge({ extends: './node_modules/@adonisjs/mrm-preset/_tsconfig' }).save()
  }
}

module.exports = new TsPreset()
