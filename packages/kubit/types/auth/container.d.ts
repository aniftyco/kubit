declare module '@ioc:Kubit/Application' {
  import { AuthManagerContract } from '@ioc:Kubit/Auth';

  export interface ContainerBindings {
    'Kubit/Auth': AuthManagerContract;
  }
}
