/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Kubit/Lucid/Schema' {
  import { Knex } from 'knex'

  import { QueryClientContract, RawQueryBindings } from '@ioc:Kubit/Lucid/Database'

  /**
   * Shape of callback to defer database calls
   */
  export type DeferCallback = (client: QueryClientContract) => void | Promise<void>

  /**
   * Shape of schema class constructor
   */
  export interface SchemaConstructorContract {
    disableTransactions: boolean
    new (db: QueryClientContract, file: string, dryRun: boolean): SchemaContract
  }

  /**
   * Shape of schema class
   */
  export interface SchemaContract {
    readonly file: string
    dryRun: boolean
    debug: boolean
    db: QueryClientContract
    schema: Knex.SchemaBuilder
    now(precision?: number): Knex.Raw
    knex(): Knex.QueryBuilder
    raw(sql: string, bindings?: RawQueryBindings): Knex.Raw
    defer: (cb: DeferCallback) => void
    up(): Promise<void> | void
    down(): Promise<void> | void
    execUp(): Promise<string[] | boolean>
    execDown(): Promise<string[] | boolean>
  }

  const Schema: SchemaConstructorContract
  export default Schema
}
