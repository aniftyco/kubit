/*
 * @kubit/application
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import validator from '@ioc:Kubit/Validator';

  export interface ContainerBindings {
    'Kubit/Validator': typeof validator;
  }
}