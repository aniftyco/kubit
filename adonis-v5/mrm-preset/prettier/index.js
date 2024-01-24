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
   * Delete old prettierrc file
   */
  const prettierRc = json('.prettierrc')
  prettierRc.delete()

  /**
   * Update package file
   */
  const pkgFile = packageJson()
  pkgFile.setScript('format', 'prettier --write .')
  pkgFile.set('prettier', {
    trailingComma: 'es5',
    semi: false,
    singleQuote: true,
    useTabs: false,
    quoteProps: 'consistent',
    bracketSpacing: true,
    arrowParens: 'always',
    printWidth: 100
  })

  const existingEslintConfig = pkgFile.get('eslintConfig')

  /**
   * Push to existing config
   */
  if (existingEslintConfig) {
    existingEslintConfig.extends = existingEslintConfig.extends || []
    existingEslintConfig.extends.push('prettier')

    existingEslintConfig.plugins = existingEslintConfig.plugins || []
    existingEslintConfig.plugins.push('prettier')

    existingEslintConfig.rules = Object.assign({}, existingEslintConfig.rules, {
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    })
  }

  pkgFile.save()

  /**
   * Add .prettierignore file
   */
  const prettierIgnore = lines('.prettierignore')
  prettierIgnore.add('build')
  prettierIgnore.add('docs')
  prettierIgnore.add('*.md')
  prettierIgnore.add('config.json')
  prettierIgnore.add('.eslintrc.json')
  prettierIgnore.add('package.json')
  prettierIgnore.add('*.html')
  prettierIgnore.add('*.txt')
  prettierIgnore.save()

  const plugins = ['prettier']

  /**
   * Only install when using eslint
   */
  if (existingEslintConfig) {
    plugins.push('eslint-plugin-prettier')
    plugins.push('eslint-config-prettier')
  }

  /**
   * Install required dependencies
   */
  install(plugins)
}

task.description = 'Adds prettier to the project'
module.exports = task
