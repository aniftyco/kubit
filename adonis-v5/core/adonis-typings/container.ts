/*
 * @kubit/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import Ace from '@ioc:Kubit/Ace'
  import { AssetsManagerContract } from '@ioc:Kubit/AssetsManager'
  import { HealthCheckContract } from '@ioc:Kubit/HealthCheck'
  import HttpExceptionHandler from '@ioc:Kubit/HttpExceptionHandler'
  import { TestUtilsContract } from '@ioc:Kubit/TestUtils'

  export interface ContainerBindings {
    'Kubit/HealthCheck': HealthCheckContract
    'Kubit/AssetsManager': AssetsManagerContract
    'Kubit/HttpExceptionHandler': typeof HttpExceptionHandler
    'Kubit/Ace': typeof Ace
    'Kubit/TestUtils': TestUtilsContract
  }
}
