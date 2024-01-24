/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { MrmError } = require('mrm-core')

/**
 * Build URL's for badges to be used inside the README.md file
 *
 * @class Services
 *
 * @param {Array}  list         Array of services from the config file
 * @param {Object} metaData     Git and package.json file metaData
 */
class Services {
  constructor (list, { owner, appveyorUsername, repoName, packageName }) {
    this.list = list
    this.appveyorUsername = appveyorUsername
    this.repoName = repoName
    this.repo = `${owner}/${repoName}`
    this.packageName = packageName
  }

  /**
   * Returns an object with the URL and IMAGE for a given
   * service.
   *
   * @method getServiceData
   *
   * @param  {String}       service
   *
   * @return {Object}
   */
  getServiceData (service) {
    switch (service) {
      case 'appveyor':
        return {
          url: `https://ci.appveyor.com/project/${this.appveyorUsername}/${this.repoName}`,
          image: `https://img.shields.io/appveyor/ci/${this.appveyorUsername}/${this.repoName}/master.svg?style=for-the-badge&logo=appveyor`
        }
      case 'circleci':
        return {
          url: `https://circleci.com/gh/${this.repo}`,
          image: `https://img.shields.io/circleci/project/github/${this.repo}/master.svg?style=for-the-badge&logo=circleci`
        }
      case 'npm':
        return {
          url: `https://npmjs.org/package/${this.packageName}`,
          image: `https://img.shields.io/npm/v/${this.packageName}.svg?style=for-the-badge&logo=npm`
        }
      case 'license':
        return {
          url: 'LICENSE.md',
          image: `https://img.shields.io/npm/l/${this.packageName}?color=blueviolet&style=for-the-badge`
        }
      case 'github-actions':
        return {
          url: `https://img.shields.io/github/workflow/status/${this.repoName}/test?style=for-the-badge`,
          image: `https://github.com/${this.repoName}/actions/workflows/test.yml`
        }
      case 'typescript':
        return {
          url: '',
          image: 'https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript'
        }
      default:
        throw new MrmError(`${service} is not supported. Please remove it from config.json file`)
    }
  }

  /**
   * Returns a multiline markdown formatted string of URL
   * definations to be used in README.md file.
   *
   * @method getUrls
   *
   * @return {String}
   */
  getUrls () {
    return this.list.map((item) => {
      const { url, image } = this.getServiceData(item)
      return `[${item}-image]: ${image}\n[${item}-url]: ${url} "${item}"`
    }).join('\n\n')
  }

  /**
   * Returns a markdown formatted reference url
   * to the badges URL's obtained using `this.getUrls()`
   *
   * @method getReferences
   *
   * @return {String}
   */
  getReferences () {
    return this.list.map((item) => {
      return `[![${item}-image]][${item}-url]`
    }).join(' ')
  }
}

module.exports = Services
