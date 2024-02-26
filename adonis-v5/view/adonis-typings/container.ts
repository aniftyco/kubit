/**
 * @kubit/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import { ViewContract } from '@ioc:Kubit/View'

  interface ContainerBindings {
    'Kubit/View': ViewContract
  }
}
