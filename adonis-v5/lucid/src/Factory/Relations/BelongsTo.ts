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
import { BelongsToRelationContract, LucidModel, LucidRow } from '@ioc:Kubit/Lucid/Orm'

import { BaseRelation } from './Base'

/**
 * A belongs to factory relation
 */
export class BelongsTo extends BaseRelation implements FactoryRelationContract {
  constructor(
    public relation: BelongsToRelationContract<LucidModel, LucidModel>,
    factory: () => FactoryBuilderQueryContract<FactoryModelContract<LucidModel>>
  ) {
    super(factory)
    this.relation.boot()
  }

  /**
   * Make relationship and set it on the parent model instance
   */
  public async make(parent: LucidRow, callback?: RelationCallback) {
    const factory = this.compile(this, parent, callback)
    const related = await factory.makeStubbed()

    this.relation.hydrateForPersistance(parent, related)
    parent.$setRelated(this.relation.relationName, related)
  }

  /**
   * Persist relationship and set it on the parent model instance
   */
  public async create(parent: LucidRow, callback?: RelationCallback) {
    const factory = this.compile(this, parent, callback)
    const related = await factory.create()

    this.relation.hydrateForPersistance(parent, related)
    parent.$setRelated(this.relation.relationName, related)
  }
}
