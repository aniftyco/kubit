/*
 * @kubit/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/HttpContext' {
  import { I18nContract } from '@ioc:Kubit/I18n';

  interface HttpContextContract {
    i18n: I18nContract;
  }
}
