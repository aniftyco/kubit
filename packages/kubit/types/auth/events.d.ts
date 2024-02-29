/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Event' {
  import {
    BasicAuthAuthenticateEventData,
    OATAuthenticateEventData,
    OATLoginEventData,
    ProvidersList,
    SessionAuthenticateEventData,
    SessionLoginEventData,
  } from '@ioc:Kubit/Auth';

  export interface EventsList {
    'adonis:basic:authenticate': BasicAuthAuthenticateEventData<keyof ProvidersList>;
    'adonis:session:login': SessionLoginEventData<keyof ProvidersList>;
    'adonis:session:authenticate': SessionAuthenticateEventData<keyof ProvidersList>;
    'adonis:api:authenticate': OATAuthenticateEventData<keyof ProvidersList>;
    'adonis:api:login': OATLoginEventData<keyof ProvidersList>;
  }
}
