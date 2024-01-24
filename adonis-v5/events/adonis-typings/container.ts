/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { EmitterContract } from '@ioc:Adonis/Core/Event'

  export interface ContainerBindings {
    'Adonis/Core/Event': EmitterContract
  }
}
