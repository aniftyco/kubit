declare module '@ioc:Kubit/Application' {
  import { CacheManagerContract } from '@ioc:Kubit/Cache';

  export interface ContainerBindings {
    'Kubit/Cache': CacheManagerContract;
  }
}
