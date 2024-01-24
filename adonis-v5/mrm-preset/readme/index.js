/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const path = require('path')
const { template, packageJson } = require('mrm-core')
const gitUserName = require('git-user-name')

const gh = require('../utils/ghAttributes')
const Services = require('../utils/Services')
const saveFile = require('../utils/saveFile')
const mergeConfig = require('../utils/mergeConfig')

function task (config) {
  const ghAttributes = gh('creating README.md file')

  mergeConfig(config, {
    packageName: packageJson().get('name') || 'Anonymous',
    repoName: ghAttributes.name,
    owner: ghAttributes.owner,
    ghUsername: gitUserName(),
    force: false,
    appveyorUsername: ghAttributes.owner
  })

  const servicesList = config.services || []

  /**
   * Adding npm, license and typescript services
   */
  servicesList.push('npm', 'license', 'typescript')

  const services = new Services(servicesList, {
    owner: config.owner,
    appveyorUsername: config.appveyorUsername,
    repoName: config.repoName,
    packageName: config.packageName
  })

  const templateFile = config.core ? 'README_CORE.md' : 'README.md'
  const readme = template('README.md', path.join(__dirname, 'templates', templateFile))
  let banner = ''

  /**
   * AdonisJS banner
   */
  if (config.packageName.startsWith('@adonisjs')) {
    banner = '<div align="center"><img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1564392111/adonis-banner_o9lunk.png" width="600px"></div>'
  }

  /**
   * Poppinss banner
   */
  if (config.packageName.startsWith('@poppinss')) {
    banner = '<div align="center"><img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1557762307/poppinss_iftxlt.jpg" width="600px"></div>'
  }

  const badges = services.getReferences()

  readme.apply(Object.assign({
    servicesUrls: services.getUrls(),
    servicesBadges: badges,
    banner: banner
  }, config))

  /**
   * Create readme file
   */
  saveFile(readme, config.force)
}

task.description = 'Add README.md file'

module.exports = task
