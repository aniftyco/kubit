/**
 * @adonisjs/encryption
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
  export interface ContainerBindings {
    'Adonis/Core/Encryption': EncryptionContract
  }
}
