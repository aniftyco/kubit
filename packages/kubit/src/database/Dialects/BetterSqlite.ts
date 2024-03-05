import { DialectContract } from '@ioc:Kubit/Database';

import { BaseSqliteDialect } from './SqliteBase';

export class BetterSqliteDialect extends BaseSqliteDialect implements DialectContract {
  public readonly name = 'better-sqlite3';
}
