import { DialectContract } from '@ioc:Kubit/Lucid/Database';

import { BaseSqliteDialect } from './SqliteBase';

export class SqliteDialect extends BaseSqliteDialect implements DialectContract {
  public readonly name = 'sqlite3';
}
