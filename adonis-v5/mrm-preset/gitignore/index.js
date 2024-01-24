/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { lines } = require('mrm-core')
const debug = require('debug')('adonis:mrm-gitignore')

/**
 * Creates `.gitignore` file. The template is same regardless of
 * config.
 *
 * @return {void}
 */
function task () {
  const file = lines('.gitignore')
  const linesToWrite = [
    'node_modules',
    'coverage',
    'test/__app',
    '.DS_STORE',
    '.nyc_output',
    '.idea',
    '.vscode/',
    '*.sublime-project',
    '*.sublime-workspace',
    '*.log',
    'build',
    'dist',
    'shrinkwrap.yaml'
  ]

  debug('.gitignore %o', linesToWrite)

  file.add(linesToWrite)
  file.save()
}

task.description = 'Adds Gitignore file'
module.exports = task
