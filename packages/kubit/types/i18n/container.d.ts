/*
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import { I18nManagerContract } from '@ioc:Kubit/I18n';

  interface ContainerBindings {
    'Kubit/I18n': I18nManagerContract;
  }
}
