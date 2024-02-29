/*
 * @kubit/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Application' {
  import { DatabaseContract } from '@ioc:Kubit/Lucid/Database';
  import { FactoryManagerContract } from '@ioc:Kubit/Lucid/Factory';
  import Migrator from '@ioc:Kubit/Lucid/Migrator';
  import * as Orm from '@ioc:Kubit/Lucid/Orm';
  import { SchemaConstructorContract } from '@ioc:Kubit/Lucid/Schema';
  import { SeederConstructorContract } from '@ioc:Kubit/Lucid/Seeder';

  export interface ContainerBindings {
    'Adonis/Lucid/Database': DatabaseContract;
    'Adonis/Lucid/Factory': FactoryManagerContract;
    'Adonis/Lucid/Orm': typeof Orm;
    'Adonis/Lucid/Migrator': typeof Migrator;
    'Adonis/Lucid/Schema': SchemaConstructorContract;
    'Adonis/Lucid/Seeder': SeederConstructorContract;
  }
}
