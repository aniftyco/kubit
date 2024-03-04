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
