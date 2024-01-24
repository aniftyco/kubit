/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const chalk = require('chalk')
const inquirer = require('inquirer')
const { json, ini, packageJson } = require('mrm-core')
const { execSync } = require('child_process')
const debug = require('debug')('adonis:mrm-init')

const gitOrigin = {
  type: 'input',
  message: 'Enter git origin url',
  validate (input) {
    return !input ? 'Please create a git project and enter it\'s remote origin' : true
  },
  when () {
    const gitFile = ini('.git/config')
    if (!gitFile.exists()) {
      return true
    }
    const origin = gitFile.get('remote "origin"')
    return !origin || !origin.url
  },
  name: 'gitOrigin'
}

/**
 * Whether written by the core team or not
 *
 * @type {Object}
 */
const isCore = {
  type: 'confirm',
  message: 'Is it a package written by the AdonisJS core team',
  name: 'core'
}

/**
 * Generate readme toc or not
 *
 * @type {Object}
 */
const generateToc = {
  type: 'confirm',
  message: 'Automatically generate TOC for the README file',
  name: 'generateToc'
}

/**
 * The minimum node version supported by the project.
 *
 * @type {Object}
 */
const minNodeVersion = {
  type: 'list',
  message: 'Select the minimum node version your project will support',
  name: 'minNodeVersion',
  choices: [
    {
      name: '16.13.1 (LTS)',
      value: '16.13.1',
    },
    {
      name: 'latest',
      value: 'latest'
    }
  ]
}

/**
 * The project license
 *
 * @type {Object}
 */
const license = {
  type: 'list',
  choices: ['Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MIT', 'Unlicense'],
  message: 'Select project license. Select Unlicense if not sure',
  name: 'license'
}

/**
 * Services to be used by the project
 *
 * @type {Object}
 */
const services = {
  type: 'checkbox',
  message: 'Select the CI services you want to use',
  choices: [
    {
      name: 'Appveyor',
      value: 'appveyor'
    },
    {
      name: 'Circle CI',
      value: 'circleci'
    },
    {
      name: 'Github actions',
      value: 'github-actions'
    },
  ],
  name: 'services'
}

/**
 * The appveyor username. Only asked when services
 * has `appveyor` in it
 *
 * @type {Object}
 */
const appveyorUsername = {
  type: 'input',
  message: 'Enter appveyor username',
  when: function (answers) {
    return answers.services.indexOf('appveyor') > -1
  },
  name: 'appveyorUsername'
}

/**
 * Ask if should configure github actions to run on windows too.
 *
 * @type {Object}
 */
const runGhActionsOnWindows = {
  type: 'confirm',
  message: 'Run github actions on windows?',
  when: function (answers) {
    return answers.services.indexOf('github-actions') > -1
  },
  name: 'runGhActionsOnWindows'
}

/**
 * The probot applications to use
 * @type {Object}
 */
const probotApps = {
  type: 'checkbox',
  message: 'Select the probot applications you want to use',
  choices: [
    {
      name: 'Stale Issues',
      value: 'stale'
    },
    {
      name: 'Lock Issues',
      value: 'lock'
    }
  ],
  name: 'probotApps'
}

/**
 * Running the task, asking questions and create a project
 * specific config file.
 *
 * @method task
 *
 * @return {void}
 */
async function task () {
  const oldConfig = json('config.json')
  /**
   * Move config file to package json
   */
  if (oldConfig.exists()) {
    packageJson().set('mrmConfig', oldConfig.get()).save()
    oldConfig.delete()
  }

  const pkg = packageJson()
  const existingAnswers = pkg.get('mrmConfig', {})

  /**
   * Fill existing values
   */
  if (existingAnswers.minNodeVersion) {
    minNodeVersion.choices.unshift({
      name: `${existingAnswers.minNodeVersion} (from existing config)`,
      value: existingAnswers.minNodeVersion,
    })
    minNodeVersion.default = 0
  }

  isCore.default = existingAnswers.core
  generateToc.default = existingAnswers.generateToc
  license.default = existingAnswers.license
  services.default = existingAnswers.services
  appveyorUsername.default = existingAnswers.appveyorUsername
  runGhActionsOnWindows.default = existingAnswers.runGhActionsOnWindows
  probotApps.default = existingAnswers.probotApps

  const answers = await inquirer.prompt([
    gitOrigin,
    minNodeVersion,
    isCore,
    generateToc,
    license,
    services,
    appveyorUsername,
    probotApps,
    runGhActionsOnWindows
  ])

  const fileContent = {
    core: answers.core,
    license: answers.license,
    services: answers.services,
    appveyorUsername: answers.appveyorUsername,
    minNodeVersion: answers.minNodeVersion,
    probotApps: answers.probotApps,
    runGhActionsOnWindows: answers.runGhActionsOnWindows
  }

  debug('init %o', fileContent)

  pkg.set('mrmConfig', fileContent)
  pkg.save()

  /**
   * Initiate git repo, when answers has gitOrigin
   */
  if (answers.gitOrigin) {
    console.log(chalk.yellow('git init'))
    execSync('git init')

    console.log(chalk.yellow(`git remote add origin ${answers.gitOrigin}`))
    execSync(`git remote add origin ${answers.gitOrigin}`)
  }
}

task.description = 'Initiate the project config file'
module.exports = task
