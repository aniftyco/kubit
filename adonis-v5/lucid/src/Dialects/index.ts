/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DialectContract, QueryClientContract, SharedConfigNode } from '@ioc:Kubit/Lucid/Database'

import { BetterSqliteDialect } from './BetterSqlite'
import { MssqlDialect } from './Mssql'
import { MysqlDialect } from './Mysql'
import { OracleDialect } from './Oracle'
import { PgDialect } from './Pg'
import { RedshiftDialect } from './Redshift'
import { SqliteDialect } from './Sqlite'

export const dialects = {
  'mssql': MssqlDialect,
  'mysql': MysqlDialect,
  'mysql2': MysqlDialect,
  'oracledb': OracleDialect,
  'postgres': PgDialect,
  'redshift': RedshiftDialect,
  'sqlite3': SqliteDialect,
  'better-sqlite3': BetterSqliteDialect,
} as {
  [key: string]: {
    new (client: QueryClientContract, config: SharedConfigNode): DialectContract
  }
}
