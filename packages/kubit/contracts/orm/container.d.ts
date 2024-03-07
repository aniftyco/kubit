declare module '@ioc:Kubit/Application' {
  import * as Orm from '@ioc:Kubit/ORM';
  import { FactoryManagerContract } from '@ioc:Kubit/ORM/Factory';

  export interface ContainerBindings {
    'Kubit/ORM': typeof Orm;
    'Kubit/ORM/Factory': FactoryManagerContract;
  }
}
