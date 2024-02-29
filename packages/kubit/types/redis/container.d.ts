declare module '@ioc:Kubit/Application' {
  import { RedisManagerContract } from '@ioc:Kubit/Redis';

  export interface ContainerBindings {
    'Kubit/Redis': RedisManagerContract;
  }
}
