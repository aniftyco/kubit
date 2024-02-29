/*
 * @kubit/mail
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MailEventData } from '@ioc:Kubit/Mail';

declare module '@ioc:Kubit/Event' {
  export interface EventsList {
    'mail:sent': MailEventData;
  }
}
