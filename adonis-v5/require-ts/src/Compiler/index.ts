/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import tsStatic from 'typescript'
import { esmRequire } from '@poppinss/utils'
import sourceMapSupport from 'source-map-support'

import { debug } from '../utils'
import { Cache, FakeCache } from '../Cache'
import { Transformers } from '../Contracts'
import { DiagnosticsReporter } from '../DiagnosticsReporter'

/**
 * Exposes the API compile source files using the tsc compiler. No
 * type checking takes place.
 */
export class Compiler {
  /**
   * In-memory compiled files cache for source maps to work.
   */
  private memCache: Map<string, string> = new Map()

  /**
   * Disk cache
   */
  private cache = this.usesCache ? new Cache(this.appRoot, this.cacheRoot) : new FakeCache()

  /**
   * Dignostic reporter to print program errors
   */
  private diagnosticsReporter = new DiagnosticsReporter(this.appRoot, this.ts, false)

  private transformers: tsStatic.CustomTransformers = {}

  constructor(
    private appRoot: string,
    private cacheRoot: string,
    private ts: typeof tsStatic,
    private options: {
      compilerOptions: tsStatic.CompilerOptions
      transformers?: Transformers
    },
    private usesCache: boolean = true
  ) {
    this.patchCompilerOptions()
    this.setupSourceMaps()
    this.resolveTransformers()
  }

  /**
   * Patch compiler options to make source map work properly
   */
  private patchCompilerOptions() {
    /**
     * Force inline source maps. We need this to avoid manual
     * lookups
     */
    this.options.compilerOptions.inlineSourceMap = true

    /**
     * Inline sources
     */
    this.options.compilerOptions.inlineSources = true

    /**
     * Remove "outDir" property, so that the source maps paths are generated
     * relative from the cwd and not the outDir.
     *
     * ts-node manually patches the source maps to use absolute paths. We cannot
     * do same, since we cache files on the disk and changing the folder name
     * of project root will corrupt the absolute path names inside the
     * source maps.
     */
    delete this.options.compilerOptions.outDir

    /**
     * Inline source maps and source map cannot be used together
     */
    delete this.options.compilerOptions.sourceMap
  }

  /**
   * Resolves transformer relative from the app root
   */
  private resolverTransformer(transformer: string) {
    try {
      const value = esmRequire(require.resolve(transformer, { paths: [this.appRoot] }))
      if (typeof value !== 'function') {
        throw new Error('Transformer module must export a function')
      }
      return value(this.ts, this.appRoot)
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(
          `Unable to resolve transformer "${transformer}" specified in tsconfig.json file`
        )
      }
      throw error
    }
  }

  /**
   * Resolve transformers
   */
  private resolveTransformers() {
    if (!this.options.transformers) {
      return
    }

    if (this.options.transformers.before) {
      this.transformers.before = this.options.transformers.before.map((transformer) => {
        return this.resolverTransformer(transformer.transform)
      })
    }

    if (this.options.transformers.after) {
      this.transformers.after = this.options.transformers.after.map((transformer) => {
        return this.resolverTransformer(transformer.transform)
      })
    }

    if (this.options.transformers.afterDeclarations) {
      this.transformers.afterDeclarations = this.options.transformers.afterDeclarations.map(
        (transformer) => {
          return this.resolverTransformer(transformer.transform)
        }
      )
    }
  }

  /**
   * Setup source maps support to read from in-memory cache
   */
  private setupSourceMaps() {
    sourceMapSupport.install({
      environment: 'node',
      retrieveFile: (pathOrUrl: string) => {
        debug('reading source for "%s"', pathOrUrl)
        return this.memCache.get(pathOrUrl) || ''
      },
    })
  }

  /**
   * Compiles the file using the typescript compiler
   */
  private compileFile(filePath: string, contents: string, virtualFile: boolean) {
    debug('compiling file using typescript "%s"', filePath)

    let { outputText, diagnostics } = this.ts.transpileModule(contents, {
      fileName: filePath,
      compilerOptions: virtualFile
        ? {
            ...this.options.compilerOptions,
            rootDir: undefined,
          }
        : this.options.compilerOptions,
      reportDiagnostics: !virtualFile,
      transformers: this.transformers,
    })

    /**
     * Report diagnostics if any
     */
    if (diagnostics) {
      this.diagnosticsReporter.report(diagnostics)
    }

    /**
     * Write to in-memory cache for sourcemaps to work
     */
    this.memCache.set(filePath, outputText)
    return outputText
  }

  /**
   * Compile typescript source code using the tsc compiler.
   */
  public compile(filePath: string, contents: string, virtualFile: boolean = false) {
    /**
     * Do not cache virtual files
     */
    if (virtualFile) {
      debug('compiling virtual file "%s" (no cache)', filePath)
      return this.compileFile(filePath, contents, true)
    }

    debug('compiling file "%s"', filePath)
    const cachePath = this.cache.makeCachePath(filePath, contents, '.js')

    /**
     * Return the file from cache when it exists
     */
    const compiledContent = this.cache.get(cachePath)
    if (compiledContent) {
      /**
       * Write to in-memory cache for sourcemaps to work
       */
      this.memCache.set(filePath, compiledContent)
      return compiledContent
    }

    /**
     * Compile file using the compiler
     */
    const outputText = this.compileFile(filePath, contents, false)

    /**
     * Write to cache on disk
     */
    this.cache.set(cachePath, outputText)

    /**
     * Return compiled text
     */
    return outputText
  }
}
