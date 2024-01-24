/**
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { SessionManagerContract } from '@ioc:Adonis/Addons/Session'

  interface ContainerBindings {
    'Adonis/Addons/Session': SessionManagerContract
  }
}
