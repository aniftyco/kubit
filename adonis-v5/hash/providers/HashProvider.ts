/*
 * @kubit/hash
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application'

export default class HashProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.singleton('Kubit/Hash', () => {
      const config = this.app.container.resolveBinding('Kubit/Config').get('hash', {})
      const { Hash } = require('../src/Hash')
      return new Hash(this, config)
    })
  }
}
