/*
 * @kubit/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Knex } from 'knex';

import { RawBuilderContract } from '@ioc:Kubit/Lucid/Database';

/**
 * Exposes the API to construct raw queries. If you want to execute
 * raw queries, you can use the RawQueryBuilder
 */
export class RawBuilder implements RawBuilderContract {
  private wrapBefore: string;
  private wrapAfter: string;

  constructor(
    private sql: string,
    private bindings?: any
  ) {}

  /**
   * Wrap the query with before/after strings.
   */
  public wrap(before: string, after: string): this {
    this.wrapAfter = after;
    this.wrapBefore = before;
    return this;
  }

  /**
   * Converts the raw query to knex raw query instance
   */
  public toKnex(client: Knex.Client): Knex.Raw {
    const rawQuery = client.raw(this.sql, this.bindings);

    if (this.wrapBefore && this.wrapAfter) {
      rawQuery.wrap(this.wrapBefore, this.wrapAfter);
    }

    return rawQuery;
  }
}
