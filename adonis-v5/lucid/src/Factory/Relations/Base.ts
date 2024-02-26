/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  FactoryBuilderQueryContract,
  FactoryContextContract,
  FactoryModelContract,
  FactoryRelationContract,
  RelationCallback,
} from '@ioc:Kubit/Lucid/Factory'
import { LucidModel, LucidRow } from '@ioc:Kubit/Lucid/Orm'

/**
 * Base relation to be extended by other factory relations
 */
export abstract class BaseRelation {
  protected ctx: FactoryContextContract
  private attributes: any = {}

  public parent: LucidRow

  constructor(
    private factory: () => FactoryBuilderQueryContract<FactoryModelContract<LucidModel>>
  ) {}

  /**
   * Instantiates the relationship factory
   */
  protected compile(
    relation: FactoryRelationContract,
    parent: LucidRow,
    callback?: RelationCallback
  ) {
    this.parent = parent
    const builder = this.factory().query(undefined, relation)
    if (typeof callback === 'function') {
      callback(builder)
    }

    builder.useCtx(this.ctx).mergeRecursive(this.attributes)
    return builder
  }

  /**
   * Merge attributes with the relationship and its children
   */
  public merge(attributes: any) {
    this.attributes = attributes
    return this
  }

  /**
   * Use custom ctx. This must always be called by the factory, otherwise
   * `make` and `create` calls will fail.
   */
  public useCtx(ctx: FactoryContextContract): this {
    this.ctx = ctx
    return this
  }
}
