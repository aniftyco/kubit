import { DialectContract } from '@ioc:Kubit/Lucid/Database';

import { BaseSqliteDialect } from './SqliteBase';

export class BetterSqliteDialect extends BaseSqliteDialect implements DialectContract {
  public readonly name = 'better-sqlite3';
}
