/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { ini, MrmError } = require('mrm-core')
const gh = require('parse-github-url')

module.exports = function (action) {
  /**
   * Ensure .git/config file exists
   */
  const ghFile = ini('.git/config')
  if (!ghFile.exists()) {
    throw new MrmError(`Initiate git repo before ${action}`)
  }

  /**
   * Ensure origin is defined
   */
  const origin = ghFile.get('remote "origin"')
  if (!origin || !origin.url) {
    throw new MrmError(`Add remote origin before ${action}`)
  }

  return gh(origin.url)
}
