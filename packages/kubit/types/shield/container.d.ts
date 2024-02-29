declare module '@ioc:Kubit/Application' {
  import { ShieldMiddlewareContract } from '@ioc:Kubit/Shield';

  export interface ContainerBindings {
    'Adonis/Lucid/Shield': ShieldMiddlewareContract;
  }
}
