/*
 * @kubit/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import { EmitterContract } from '@ioc:Kubit/Event'

  export interface ContainerBindings {
    'Kubit/Event': EmitterContract
  }
}
