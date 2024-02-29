/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import { AuthManagerContract } from '@ioc:Kubit/Auth';

  export interface ContainerBindings {
    'Kubit/Auth': AuthManagerContract;
  }
}
