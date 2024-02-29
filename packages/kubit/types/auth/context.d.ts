/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/HttpContext' {
  import { AuthContract } from '@ioc:Kubit/Auth';

  interface HttpContextContract {
    auth: AuthContract;
  }
}
