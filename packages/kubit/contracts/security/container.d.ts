declare module '@ioc:Kubit/Application' {
  import { SecurityMiddlewareContract } from '@ioc:Kubit/Security';

  export interface ContainerBindings {
    'Kubit/Security': SecurityMiddlewareContract;
  }
}
