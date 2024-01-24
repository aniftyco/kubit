/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { addHook } from 'pirates'
import tsStatic from 'typescript'
import findCacheDir from 'find-cache-dir'

import { Cache } from './src/Cache'
import { Config } from './src/Config'
import { Compiler } from './src/Compiler'
import { loadTypescript } from './src/utils'
import { Transformers } from './src/Contracts'

/**
 * Extensions to register require extension for
 */
const EXTS = ['.ts', '.tsx']
const CACHE_DIR_NAME = 'adonis-require-ts'

/**
 * Symbols that can be used to get the global reference of the compiler
 */
export const symbols = {
  compiler: Symbol.for('REQUIRE_TS_COMPILER'),
  config: Symbol.for('REQUIRE_TS_CONFIG'),
}

/**
 * Returns helpers to along with cache when using a watcher.
 *
 * - You can check if the tsconfig file inside the cache is stale or not.
 * 	 If it is stale, then clear the entire cache
 *
 * - Clear cache for a given file path.
 * - Clear all cache
 */
export function getWatcherHelpers(appRoot: string, cachePath?: string) {
  cachePath = cachePath || findCacheDir({ name: CACHE_DIR_NAME })
  const cache = new Cache(appRoot, cachePath!)

  return {
    clear(filePath?: string) {
      return filePath ? cache.clearForFile(filePath) : cache.clearAll()
    },
    isConfigStale: () => {
      const config = new Config(appRoot, cachePath!, undefined, true)
      const { cached } = config.getCached()
      return !cached || cached.version !== Config.version
    },
  }
}

/**
 * Load in-memory typescript compiler
 */
export function loadCompiler(
  appRoot: string,
  options: {
    compilerOptions: tsStatic.CompilerOptions
    transformers?: Transformers
  }
) {
  const typescript = loadTypescript(appRoot)
  return new Compiler(appRoot, appRoot, typescript, options, false)
}

/**
 * Register hook to compile typescript files in-memory. When
 * caching is enabled, the compiled files will be written
 * on the disk
 */
export function register(
  appRoot: string,
  opts?: {
    cache?: boolean
    cachePath?: string
    transformers?: Transformers
  }
) {
  /**
   * Normalize options
   */
  opts = Object.assign({ cache: false, cachePath: '' }, opts)
  if (opts.cache && !opts.cachePath) {
    opts.cachePath = findCacheDir({ name: CACHE_DIR_NAME })
  }

  const typescript = loadTypescript(appRoot)

  /**
   * Parse config
   */
  const config = new Config(appRoot, opts.cachePath!, typescript, !!opts.cache).parse()

  /**
   * Cannot continue when config has errors
   */
  if (config.error) {
    process.exit(1)
  }

  /**
   * Merge transformers when defined
   */
  if (opts.transformers) {
    config.options!.transformers = config.options!.transformers || {}

    if (opts.transformers.before) {
      config.options!.transformers.before = (config.options!.transformers.before || []).concat(
        opts.transformers.before
      )
    }

    if (opts.transformers.after) {
      config.options!.transformers.after = (config.options!.transformers.after || []).concat(
        opts.transformers.after
      )
    }

    if (opts.transformers.afterDeclarations) {
      config.options!.transformers.afterDeclarations = (
        config.options!.transformers.afterDeclarations || []
      ).concat(opts.transformers.afterDeclarations)
    }
  }

  /**
   * Instantiate compiler to compile `.ts` files using the typescript compiler. Currently
   * we not resolve `.js` files and will never resolve `.tsx` or `.jsx` files.
   */
  const compiler = new Compiler(appRoot, opts.cachePath!, typescript, config.options!, !!opts.cache)
  global[symbols.compiler] = compiler
  global[symbols.config] = config

  addHook(
    (code, filename) => {
      return compiler.compile(filename, code)
    },
    { exts: EXTS, matcher: () => true }
  )
}
