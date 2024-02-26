/**
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/HttpContext' {
import { SessionContract } from '@ioc:Kubit/Session';

    interface HttpContextContract {
    session: SessionContract
  }
}
