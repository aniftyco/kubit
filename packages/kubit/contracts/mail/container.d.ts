declare module '@ioc:Kubit/Application' {
  import { MailManagerContract } from '@ioc:Kubit/Mail';

  export interface ContainerBindings {
    'Kubit/Mail': MailManagerContract;
  }
}
