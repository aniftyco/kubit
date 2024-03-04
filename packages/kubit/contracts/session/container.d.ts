declare module '@ioc:Kubit/Application' {
  import { SessionManagerContract } from '@ioc:Kubit/Session';

  interface ContainerBindings {
    'Kubit/Session': SessionManagerContract;
  }
}
