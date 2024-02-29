import { MailEventData } from '@ioc:Kubit/Mail';

declare module '@ioc:Kubit/Event' {
  export interface EventsList {
    'mail:sent': MailEventData;
  }
}
