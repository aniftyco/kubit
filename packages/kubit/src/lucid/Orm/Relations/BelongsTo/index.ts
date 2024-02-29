import { OneOrMany, QueryClientContract } from '@ioc:Kubit/Lucid/Database';
import {
  BelongsTo as ModelBelongsTo,
  BelongsToRelationContract,
  LucidModel,
  LucidRow,
  ModelObject,
  RelationOptions,
} from '@ioc:Kubit/Lucid/Orm';

import { ensureRelationIsBooted, getValue } from '../../../utils';
import { KeysExtractor } from '../KeysExtractor';
import { BelongsToQueryClient } from './QueryClient';

/**
 * Manages loading and persisting belongs to relationship
 */
export class BelongsTo implements BelongsToRelationContract<LucidModel, LucidModel> {
  /**
   * Relationship name
   */
  public readonly type = 'belongsTo';

  /**
   * Whether or not the relationship instance has been booted
   */
  public booted: boolean = false;

  /**
   * The key name for serializing the relationship
   */
  public serializeAs = this.options.serializeAs === undefined ? this.relationName : this.options.serializeAs;

  /**
   * Local key is reference to the primary key in the related table
   * @note: Available after boot is invoked
   */
  public localKey: string;
  public localKeyColumName: string;

  /**
   * Foreign key is reference to the foreign key in the self table
   * @note: Available after boot is invoked
   */
  public foreignKey: string;
  public foreignKeyColumName: string;

  /**
   * Reference to the onQuery hook defined by the user
   */
  public onQueryHook = this.options.onQuery;

  constructor(
    public relationName: string,
    public relatedModel: () => LucidModel,
    private options: RelationOptions<ModelBelongsTo<LucidModel>>,
    public model: LucidModel
  ) {}

  /**
   * Clone relationship instance
   */
  public clone(parent: LucidModel): any {
    return new BelongsTo(this.relationName, this.relatedModel, { ...this.options }, parent);
  }

  /**
   * Returns a boolean telling if the related row belongs to the parent
   * row or not.
   */
  private isRelatedRow(parent: LucidRow, related: LucidRow) {
    return related[this.localKey] !== undefined && parent[this.foreignKey] === related[this.localKey];
  }

  /**
   * Boot the relationship and ensure that all keys are in
   * place for queries to do their job.
   */
  public boot() {
    if (this.booted) {
      return;
    }

    const relatedModel = this.relatedModel();

    /**
     * Extracting keys from the model and the relation model. The keys
     * extractor ensures all the required columns are defined on
     * the models for the relationship to work
     */
    const { localKey, foreignKey } = new KeysExtractor(this.model, this.relationName, {
      localKey: {
        model: relatedModel,
        key:
          this.options.localKey ||
          this.model.namingStrategy.relationLocalKey(this.type, this.model, relatedModel, this.relationName),
      },
      foreignKey: {
        model: this.model,
        key:
          this.options.foreignKey ||
          this.model.namingStrategy.relationForeignKey(this.type, this.model, relatedModel, this.relationName),
      },
    }).extract();

    /**
     * Keys on the related model
     */
    this.localKey = localKey.attributeName;
    this.localKeyColumName = localKey.columnName;

    /**
     * Keys on the parent model
     */
    this.foreignKey = foreignKey.attributeName;
    this.foreignKeyColumName = foreignKey.columnName;

    /**
     * Booted successfully
     */
    this.booted = true;
  }

  /**
   * Set related model instance
   */
  public setRelated(parent: LucidRow, related: LucidRow | null): void {
    ensureRelationIsBooted(this);
    if (related === undefined) {
      return;
    }

    parent.$setRelated(this.relationName, related);
  }

  /**
   * Push related model instance
   */
  public pushRelated(parent: LucidRow, related: LucidRow | null): void {
    ensureRelationIsBooted(this);
    if (related === undefined) {
      return;
    }

    parent.$setRelated(this.relationName, related);
  }

  /**
   * Finds and set the related model instance next to the parent
   * models.
   */
  public setRelatedForMany(parent: LucidRow[], related: LucidRow[]): void {
    ensureRelationIsBooted(this);

    parent.forEach((parentRow) => {
      const match = related.find((relatedRow) => this.isRelatedRow(parentRow, relatedRow));
      this.setRelated(parentRow, match || null);
    });
  }

  /**
   * Returns an instance of query client for the given relationship
   */
  public client(parent: LucidRow, client: QueryClientContract): any {
    ensureRelationIsBooted(this);
    return new BelongsToQueryClient(this, parent, client);
  }

  /**
   * Returns instance of the eager query for the relationship
   */
  public eagerQuery(parent: OneOrMany<LucidRow>, client: QueryClientContract): any {
    ensureRelationIsBooted(this);
    return BelongsToQueryClient.eagerQuery(client, this, parent);
  }

  /**
   * Returns instance of query builder
   */
  public subQuery(client: QueryClientContract) {
    ensureRelationIsBooted(this);
    return BelongsToQueryClient.subQuery(client, this);
  }

  /**
   * Hydrates values object for persistance.
   */
  public hydrateForPersistance(parent: LucidRow, related: ModelObject | LucidRow) {
    parent[this.foreignKey] = getValue(related, this.localKey, this, 'associate');
  }
}
