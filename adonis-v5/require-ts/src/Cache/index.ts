/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import revHash from 'rev-hash'
import { readFileSync, outputFileSync, removeSync } from 'fs-extra'
import { getCachePathForFile, debug } from '../utils'

/**
 * Exposes the API to write file parsed contents to disk as cache. Handles
 * all the complexity of generate correct paths and creating contents
 * hash
 */
export class Cache {
  constructor(private appRoot: string, private cacheRoot: string) {}

  /**
   * Generates hash from file contents
   */
  public generateHash(contents: string) {
    return revHash(contents)
  }

  /**
   * Makes cache path from a given file path and its contents
   */
  public makeCachePath(filePath: string, contents: string, extname: '.js' | '.json') {
    const relativeCachePath = getCachePathForFile(this.appRoot, filePath)
    const hash = this.generateHash(contents)
    return join(this.cacheRoot, relativeCachePath, `${hash}${extname}`)
  }

  /**
   * Returns the file contents from the cache (if exists), otherwise
   * returns null
   */
  public get(cachePath: string): string | null {
    try {
      const contents = readFileSync(cachePath, 'utf8')
      debug('reading from cache "%s"', cachePath)
      return contents
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null
      }
      throw error
    }
  }

  /**
   * Writes file contents to the disk
   */
  public set(cachePath: string, contents: string) {
    debug('writing to cache "%s"', cachePath)
    outputFileSync(cachePath, contents)
  }

  /**
   * Clears all the generate cache for a given file
   */
  public clearForFile(filePath: string) {
    debug('clear cache for "%s"', filePath)
    const relativeCachePath = getCachePathForFile(this.appRoot, filePath)
    removeSync(join(this.cacheRoot, relativeCachePath))
  }

  /**
   * Clears the cache root folder
   */
  public clearAll() {
    removeSync(this.cacheRoot)
  }
}

/**
 * A parallel fake implementation of cache that results in noop. Used
 * when caching is disabled.
 */
export class FakeCache {
  constructor() {}

  /**
   * Generates hash from file contents
   */
  public generateHash(_: string) {
    return ''
  }

  /**
   * Makes cache path from a given file path and its contents
   */
  public makeCachePath(_: string, __: string, ___: '.js' | '.json') {
    return ''
  }

  /**
   * Returns the file contents from the cache (if exists), otherwise
   * returns null
   */
  public get(_: string): string | null {
    return null
  }

  /**
   * Writes file contents to the disk
   */
  public set(_: string, __: string) {}

  /**
   * Clears all the generate cache for a given file
   */
  public clearForFile(_: string) {}

  /**
   * Clears the cache root folder
   */
  public clearAll() {}
}
