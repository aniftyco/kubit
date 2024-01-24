/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Debug from 'debug'
import normalizePath from 'normalize-path'

export const debug = Debug('adonis:require-ts')

/**
 * Returns the cache directory path for a given file. The idea is to
 * use the filename as a directory and then drop files with their
 * hashes inside that directory. In case the file gets changed,
 * we just need to drop the directory
 */
export function getCachePathForFile(cwd: string, location: string) {
  const tokens = normalizePath(location.replace(cwd, '')).split('/')
  const fileName = tokens.pop()
  tokens.shift()

  if (!tokens.length) {
    return fileName.replace(/\.\w+$/, '')
  }

  return `${tokens.join('-')}-${fileName.replace(/\.\w+$/, '')}`
}

/**
 * Loads typescript from the user project dependencies
 */
export function loadTypescript(cwd: string) {
  try {
    return require(require.resolve('typescript', { paths: [cwd] }))
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('"@adonisjs/require-ts" expects the "typescript" to be installed')
    }
    throw error
  }
}
