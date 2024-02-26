/*
 * @kubit/encryption
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Kubit/Application'

/**
 * Encryption provider to binding encryption class to the container
 */
export default class EncryptionProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.singleton('Kubit/Encryption', () => {
      const Config = this.app.container.resolveBinding('Kubit/Config')
      const { Encryption } = require('../src/Encryption')
      return new Encryption({ secret: Config.get('app.appKey') })
    })
  }
}
