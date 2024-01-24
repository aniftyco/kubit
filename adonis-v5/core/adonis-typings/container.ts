/*
 * @kubit/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
  import Ace from '@ioc:Adonis/Core/Ace'
  import { AssetsManagerContract } from '@ioc:Adonis/Core/AssetsManager'
  import { HealthCheckContract } from '@ioc:Adonis/Core/HealthCheck'
  import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
  import { TestUtilsContract } from '@ioc:Adonis/Core/TestUtils'

  export interface ContainerBindings {
    'Adonis/Core/HealthCheck': HealthCheckContract
    'Adonis/Core/AssetsManager': AssetsManagerContract
    'Adonis/Core/HttpExceptionHandler': typeof HttpExceptionHandler
    'Adonis/Core/Ace': typeof Ace
    'Adonis/Core/TestUtils': TestUtilsContract
  }
}
