import { Knex } from 'knex';

import { ReferenceBuilderContract } from '@ioc:Kubit/Lucid/Database';

/**
 * Reference builder to create SQL reference values
 */
export class ReferenceBuilder implements ReferenceBuilderContract {
  private schema: string;
  private alias: string;

  constructor(
    private ref: string,
    private client: Knex.Client
  ) {}

  /**
   * Define schema
   */
  public withSchema(schema: string): this {
    this.schema = schema;
    return this;
  }

  /**
   * Define alias
   */
  public as(alias: string): this {
    this.alias = alias;
    return this;
  }

  /**
   * Converts reference to knex
   */
  public toKnex(client?: Knex.Client) {
    const ref = (client || this.client).ref(this.ref);
    this.schema && ref.withSchema(this.schema);
    this.alias && ref.as(this.alias);

    return ref;
  }
}
