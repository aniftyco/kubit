import { DialectContract, QueryClientContract, SharedConfigNode } from '@ioc:Kubit/Database';

import { BetterSqliteDialect } from './BetterSqlite';
import { MssqlDialect } from './Mssql';
import { MysqlDialect } from './Mysql';
import { OracleDialect } from './Oracle';
import { PgDialect } from './Pg';
import { RedshiftDialect } from './Redshift';
import { SqliteDialect } from './Sqlite';

export const dialects = {
  mssql: MssqlDialect,
  mysql: MysqlDialect,
  mysql2: MysqlDialect,
  oracledb: OracleDialect,
  postgres: PgDialect,
  redshift: RedshiftDialect,
  sqlite3: SqliteDialect,
  'better-sqlite3': BetterSqliteDialect,
} as {
  [key: string]: {
    new (client: QueryClientContract, config: SharedConfigNode): DialectContract;
  };
};
