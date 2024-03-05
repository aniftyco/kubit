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
    'kubit:basic:authenticate': BasicAuthAuthenticateEventData<keyof ProvidersList>;
    'kubit:session:login': SessionLoginEventData<keyof ProvidersList>;
    'kubit:session:authenticate': SessionAuthenticateEventData<keyof ProvidersList>;
    'kubit:api:authenticate': OATAuthenticateEventData<keyof ProvidersList>;
    'kubit:api:login': OATLoginEventData<keyof ProvidersList>;
  }
}
