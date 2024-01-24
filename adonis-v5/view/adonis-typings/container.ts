/**
 * @adonisjs/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import { ViewContract } from '@ioc:Adonis/Core/View'

  interface ContainerBindings {
    'Adonis/Core/View': ViewContract
  }
}
