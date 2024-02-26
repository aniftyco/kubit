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
  FactoryModelContract,
  FactoryRelationContract,
  RelationCallback,
} from '@ioc:Kubit/Lucid/Factory'
import { HasManyRelationContract, LucidModel, LucidRow } from '@ioc:Kubit/Lucid/Orm'

import { BaseRelation } from './Base'

/**
 * Has many to factory relation
 */
export class HasMany extends BaseRelation implements FactoryRelationContract {
  constructor(
    public relation: HasManyRelationContract<LucidModel, LucidModel>,
    factory: () => FactoryBuilderQueryContract<FactoryModelContract<LucidModel>>
  ) {
    super(factory)
    this.relation.boot()
  }

  /**
   * Make relationship and set it on the parent model instance
   */
  public async make(parent: LucidRow, callback?: RelationCallback, count?: number) {
    const factory = this.compile(this, parent, callback)

    const customAttributes = {}
    this.relation.hydrateForPersistance(parent, customAttributes)

    const instances = await factory
      .tap((related) => {
        related.merge(customAttributes)
      })
      .makeStubbedMany(count || 1)

    parent.$setRelated(this.relation.relationName, instances)
  }

  /**
   * Persist relationship and set it on the parent model instance
   */
  public async create(parent: LucidRow, callback?: RelationCallback, count?: number) {
    const factory = this.compile(this, parent, callback)

    const customAttributes = {}
    this.relation.hydrateForPersistance(parent, customAttributes)

    const instance = await factory
      .tap((related) => {
        related.merge(customAttributes)
      })
      .createMany(count || 1)

    parent.$setRelated(this.relation.relationName, instance)
  }
}
