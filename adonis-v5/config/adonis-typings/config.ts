/*
 * @adonisjs/config
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Config' {
  /**
   * The config module de-couples the application configuration from the filesystem
   * and offers a unified API to read the application configuration. For example:
   *
   * If a module `X` relies on the `config/database.ts` file, instead of requiring
   * it directly from the filesystem, it should use the `ConfigProvider` to
   * read the config as `Config.get('database')`.
   *
   * The values for a specific object property can be read using the dot-notation.
   * `Config.get('database.connections.mysql')`.
   *
   * @singleton
   *
   * @example
   * ```ts
   * import Config from '@ioc:Adonis/Core/Config'
   * ```
   */
  export interface ConfigContract {
    /**
     * Returns complete config
     */
    all(): any

    /**
     * Get configuration from a config file and optionally access the object
     * properties using the `dot notation`.
     *
     * @example
     * ```ts
     * // will read from the `config/database.ts` file
     * Config.get('database')
     *
     * // access `connections.mysql` property
     * Config.get('database.connections.mysql')
     * ```
     */
    get(key: string, defaultValue?: any): any

    /**
     * Similar to `Config.get`, but you can also define default values, which
     * are merged with the user defined values.
     *
     * The user defined values are preferred over the default values.
     */
    merge(key: string, defaultValues: object, customizer?: Function): any

    /**
     * Set/update value for a given path
     */
    set(key: string, value: any): void

    /**
     * Define default values for a given path. The user defined values will be
     * merged with the default values.
     *
     * This method is mainly used by the providers and not in the user land.
     *
     * @example
     * ```ts
     * Config.defaults('database', {
     *   connection: 'mysql',
     *   connections: {},
     * })
     * ```
     */
    defaults(key: string, value: any): void
  }

  const Config: ConfigContract
  export default Config
}
