/*
* @adonisjs/mrm-preset
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const { ini } = require('mrm-core')
const debug = require('debug')('adonis:mrm-editorconfig')

/**
 * The defaults has precedence over the contents inside
 * the user config file. This is the only way we can
 * keep the config files updates
 *
 * @type {Object}
 */
const defaults = {
  '*': {
    indent_style: 'space',
    indent_size: 2,
    end_of_line: 'lf',
    charset: 'utf-8',
    trim_trailing_whitespace: true,
    insert_final_newline: true
  },
  '*.json': {
    insert_final_newline: 'ignore'
  },
  '**.min.js': {
    indent_style: 'ignore',
    insert_final_newline: 'ignore'
  },
  MakeFile: {
    indent_style: 'space'
  },
  '*.md': {
    trim_trailing_whitespace: false
  }
}

/**
 * Merge section with the default config
 *
 * @param  {String}
 * @param  {Object}
 * @return {Object}
 */
function mergeSection (section, existing = {}) {
  const defaultConfig = defaults[section] || {}
  return Object.assign(existing, defaultConfig)
}

/**
 * Creates `.editorconfig` file. The config file is same for
 * all projects and doesn't divert on the basis of config
 *
 * @return {void}
 */
function task () {
  const file = ini('.editorconfig', 'http://editorconfig.org')

  Object.keys(defaults).forEach((name) => {
    const values = mergeSection(name, file.get(name))
    debug('section %s: %o', name, values)
    file.set(name, values)
  })

  file.save()
}

task.description = 'Adds EditorConfig file'

module.exports = task
