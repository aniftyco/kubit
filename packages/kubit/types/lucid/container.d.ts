declare module '@ioc:Kubit/Application' {
import { DatabaseContract } from '@ioc:Kubit/Lucid/Database';
import { FactoryManagerContract } from '@ioc:Kubit/Lucid/Factory';
import Migrator from '@ioc:Kubit/Lucid/Migrator';
import * as Orm from '@ioc:Kubit/Lucid/Orm';
import { SchemaConstructorContract } from '@ioc:Kubit/Lucid/Schema';
import { SeederConstructorContract } from '@ioc:Kubit/Lucid/Seeder';

    export interface ContainerBindings {
    'Kubit/Lucid/Database': DatabaseContract;
    'Kubit/Lucid/Factory': FactoryManagerContract;
    'Kubit/Lucid/Orm': typeof Orm;
    'Kubit/Lucid/Migrator': typeof Migrator;
    'Kubit/Lucid/Schema': SchemaConstructorContract;
    'Kubit/Lucid/Seeder': SeederConstructorContract;
  }
}
