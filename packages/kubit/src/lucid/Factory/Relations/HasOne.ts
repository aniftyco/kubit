import {
  FactoryBuilderQueryContract,
  FactoryModelContract,
  FactoryRelationContract,
  RelationCallback,
} from '@ioc:Kubit/Lucid/Factory';
import { HasOneRelationContract, LucidModel, LucidRow } from '@ioc:Kubit/Lucid/Orm';

import { BaseRelation } from './Base';

/**
 * Has one to factory relation
 */
export class HasOne extends BaseRelation implements FactoryRelationContract {
  constructor(
    public relation: HasOneRelationContract<LucidModel, LucidModel>,
    factory: () => FactoryBuilderQueryContract<FactoryModelContract<LucidModel>>
  ) {
    super(factory);
    this.relation.boot();
  }

  /**
   * Make relationship and set it on the parent model instance
   */
  public async make(parent: LucidRow, callback?: RelationCallback) {
    const factory = this.compile(this, parent, callback);
    const customAttributes = {};
    this.relation.hydrateForPersistance(parent, customAttributes);

    const instance = await factory.tap((related) => related.merge(customAttributes)).makeStubbed();
    parent.$setRelated(this.relation.relationName, instance);
  }

  /**
   * Persist relationship and set it on the parent model instance
   */
  public async create(parent: LucidRow, callback?: RelationCallback) {
    const factory = this.compile(this, parent, callback);

    const customAttributes = {};
    this.relation.hydrateForPersistance(parent, customAttributes);

    const instance = await factory.tap((related) => related.merge(customAttributes)).create();
    parent.$setRelated(this.relation.relationName, instance);
  }
}
