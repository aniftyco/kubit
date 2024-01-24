/*
 * @adonisjs/config
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/config.ts" />

import { lodash } from '@poppinss/utils'
import { ConfigContract } from '@ioc:Adonis/Core/Config'

/**
 * Config module eases the process of using configuration inside your AdonisJs
 * applications.
 *
 * The config files are stored inside a seperate directory, which are loaded and cached
 * on application boot. Later you can access the values using the `dot` syntax.
 *
 * ## Access values
 *
 * 1. **Given the config file is stored as `config/app.js` with following content**
 *
 * ```js
 * module.exports = {
 *  appKey: ''
 * }
 * ```
 *
 * 2. **You access the appKey as follows**
 *
 * ```js
 * Config.get('app.appKey')
 * ```
 *
 * **NOTE:**
 * The `get` method doesn't raise runtime exceptions when top level objects are missing.
 */
export class Config implements ConfigContract {
  constructor(private config = {}) {}

  /**
   * Returns complete config
   */
  public all() {
    return this.config
  }

  /**
   * Read value from the pre-loaded config. Make use of the `dot notation`
   * syntax to read nested values.
   *
   * The `defaultValue` is returned when original value is `undefined`.
   *
   * @example
   * ```js
   * Config.get('database.mysql')
   * ```
   */
  public get(key: string, defaultValue?: any): any {
    return lodash.get(this.config, key, defaultValue)
  }

  /**
   * Fetch and merge an object to the existing config. This method is useful
   * when you are fetching an object from the config and want to merge
   * it with some default values.
   *
   * An optional customizer can be passed to customize the merge operation.
   * The function is directly passed to [lodash.mergeWith](https://lodash.com/docs/4.17.10#mergeWith)
   * method.
   *
   * @example
   * ```js
   * // Config inside the file will be merged with the given object
   *
   * Config.merge('database.mysql', {
   *   host: '127.0.0.1',
   *   port: 3306
   * })
   * ```
   */
  public merge(key: string, defaultValues: object, customizer?: (...args: any[]) => any): any {
    return lodash.mergeWith(defaultValues, this.get(key), customizer)
  }

  /**
   * Defaults allows providers to define the default config for a
   * module, which is merged with the user config
   */
  public defaults(key: string, value: any): void {
    const existingValue = this.get(key)
    if (existingValue) {
      lodash.mergeWith(value, existingValue)
    }

    this.set(key, value)
  }

  /**
   * Update in memory value of the pre-loaded config
   *
   * @example
   * ```js
   * Config.set('database.host', '127.0.0.1')
   * ```
   */
  public set(key: string, value: any): void {
    lodash.set(this.config, key, value)
  }
}
