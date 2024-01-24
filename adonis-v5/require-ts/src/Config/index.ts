/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import tsStatic from 'typescript'
import { readFileSync } from 'fs-extra'

import { debug } from '../utils'
import { Transformers } from '../Contracts'
import { Cache, FakeCache } from '../Cache'
import { DiagnosticsReporter } from '../DiagnosticsReporter'

/**
 * Exposes the API to parse tsconfig file and cache it until the
 * contents of the file are changed.
 */
export class Config {
  public static version = 'v1'

  /**
   * Hard assumption has been made that config file name
   * is "tsconfig.json"
   */
  private configFilePath = join(this.appRoot, 'tsconfig.json')

  /**
   * Reference to the cache
   */
  private cache = this.usesCache ? new Cache(this.appRoot, this.cacheRoot) : new FakeCache()

  /**
   * Dignostic reporter to print program errors
   */
  private diagnosticsReporter = this.ts
    ? new DiagnosticsReporter(this.appRoot, this.ts, false)
    : undefined

  constructor(
    private appRoot: string,
    private cacheRoot: string,
    private ts?: typeof tsStatic,
    private usesCache: boolean = true
  ) {}

  /**
   * Returns the raw contents of the config file. We need to read this
   * always to generate the hash and then look for the cached config
   * file.
   */
  private getConfigRawContents(): string {
    debug('checking for tsconfig "%s"', this.configFilePath)

    try {
      return readFileSync(this.configFilePath, 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(
          '"@adonisjs/require-ts" expects the "tsconfig.json" file to exists in the app root'
        )
      }

      throw error
    }
  }

  /**
   * Parses the ts config using the typescript compiler
   */
  private parseTsConfig(): { error: null | tsStatic.Diagnostic[]; options: any } {
    let exception: any = null
    debug('parse tsconfig file')

    if (!this.ts) {
      throw new Error(
        'Cannot parse typescript config. Make sure to instantiate Config class with typescript compiler'
      )
    }

    /**
     * Parse config using typescript compiler
     */
    const config = this.ts.getParsedCommandLineOfConfigFile(
      this.configFilePath,
      {},
      {
        ...this.ts.sys,
        useCaseSensitiveFileNames: true,
        getCurrentDirectory: () => this.appRoot,
        onUnRecoverableConfigFileDiagnostic: (error: any) => (exception = error),
      }
    )

    /**
     * Return exception as it is
     */
    if (exception) {
      return {
        error: exception,
        options: null,
      }
    }

    /**
     * Return diagnostic errors if any
     */
    if (config!.errors && config!.errors.length) {
      return {
        error: config!.errors,
        options: null,
      }
    }

    /**
     * Return compiler options
     */
    return {
      error: null,
      options: config!.options,
    }
  }

  /**
   * Parses the cached config string as JSON. Errors
   * are ignored and hence cache is ignored too
   */
  private parseConfigAsJson(config: string | null) {
    if (!config) {
      return null
    }

    try {
      return JSON.parse(config)
    } catch (error) {
      return null
    }
  }

  /**
   * Extracts transformers the tsconfig file contents
   */
  private extractTransformers(rawConfig: string): Transformers | undefined {
    try {
      const transformers = JSON.parse(rawConfig).transformers || {}
      return {
        before: transformers.before,
        after: transformers.after,
        afterDeclarations: transformers.afterDeclarations,
      }
    } catch (error) {}
  }

  /**
   * Returns the config file from the cache or returns null when there is
   * no cache
   */
  public getCached(): {
    raw: string
    cachePath: string
    cached: null | {
      version: string
      options: { compilerOptions: tsStatic.CompilerOptions; transformers?: Transformers }
    }
  } {
    const rawContents = this.getConfigRawContents()
    const cachePath = this.cache.makeCachePath(this.configFilePath, rawContents, '.json')
    return {
      raw: rawContents,
      cachePath,
      cached: this.parseConfigAsJson(this.cache.get(cachePath)),
    }
  }

  /**
   * Parses config and returns the compiler options
   */
  public parse(): {
    version: string
    options: null | { compilerOptions: tsStatic.CompilerOptions; transformers?: Transformers }
    error: null | tsStatic.Diagnostic[]
  } {
    if (!this.diagnosticsReporter) {
      throw new Error(
        'Cannot parse typescript config. Make sure to instantiate Config class with typescript compiler'
      )
    }

    /**
     * Cache exists and is upto date
     */
    const { cached, raw, cachePath } = this.getCached()
    if (cached && cached.version === Config.version) {
      return {
        version: cached.version,
        error: null,
        options: {
          compilerOptions: cached.options.compilerOptions,
          transformers: cached.options.transformers,
        },
      }
    }

    /**
     * Parse the config using the compiler
     */
    const config = this.parseTsConfig()
    if (config.error) {
      this.diagnosticsReporter.report(config.error)
      return {
        version: Config.version,
        options: null,
        error: config.error,
      }
    }

    /**
     * Write to cache to avoid future parsing
     */
    const parsed = {
      version: Config.version,
      error: null,
      options: {
        compilerOptions: config.options,
        transformers: this.extractTransformers(raw),
      },
    }

    this.cache.set(cachePath, JSON.stringify(parsed))
    return parsed
  }
}
