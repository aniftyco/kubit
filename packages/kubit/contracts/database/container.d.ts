declare module '@ioc:Kubit/Application' {
  import { DatabaseContract } from '@ioc:Kubit/Database';
  import Migrator from '@ioc:Kubit/Database/Migrator';
  import { SchemaConstructorContract } from '@ioc:Kubit/Database/Schema';
  import { SeederConstructorContract } from '@ioc:Kubit/Database/Seeder';

  export interface ContainerBindings {
    'Kubit/Database': DatabaseContract;
    'Kubit/Database/Migrator': typeof Migrator;
    'Kubit/Database/Schema': SchemaConstructorContract;
    'Kubit/Database/Seeder': SeederConstructorContract;
  }
}
