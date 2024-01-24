/*
 * @adonisjs/shield
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { ShieldMiddlewareContract } from '@ioc:Adonis/Addons/Shield'

  export interface ContainerBindings {
    'Adonis/Lucid/Shield': ShieldMiddlewareContract
  }
}
