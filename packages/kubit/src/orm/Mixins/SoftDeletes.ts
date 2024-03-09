import { DateTime } from 'luxon';

import { QueryClientContract } from '@ioc:Kubit/Database';
import { NormalizeConstructor } from '@ioc:Kubit/Helpers';
import { LucidModel, ModelQueryBuilderContract } from '@ioc:Kubit/ORM';
import { Exception } from '@poppinss/utils';

import { beforeFetch, beforeFind, beforePaginate, column } from '../Decorators';

export function SoftDeletes<T extends NormalizeConstructor<LucidModel>>(superclass: T) {
  class ModelWithSoftDeletes extends superclass {
    @beforeFind()
    @beforeFetch()
    public static ignoreDeleted<Model extends typeof ModelWithSoftDeletes>(
      query: ModelQueryBuilderContract<Model>
    ): void {
      if (query['ignoreDeleted'] === false) {
        return;
      }
      const isGroupLimitQuery = query.clone().toQuery().includes('adonis_group_limit_counter');
      const deletedAtColumn = query.model.$getColumn('deletedAt')?.columnName;

      const queryIgnoreDeleted = isGroupLimitQuery ? query.knexQuery['_single'].table : query;

      queryIgnoreDeleted.whereNull(`${query.model.table}.${deletedAtColumn}`);
    }

    @beforePaginate()
    public static ignoreDeletedPaginate([countQuery, query]): void {
      countQuery['ignoreDeleted'] = query['ignoreDeleted'];
      this.ignoreDeleted(countQuery);
    }

    public static disableIgnore<Model extends typeof ModelWithSoftDeletes>(
      query: ModelQueryBuilderContract<Model>
    ): ModelQueryBuilderContract<Model> {
      if (query['ignoreDeleted'] === false) {
        return query;
      }
      query['ignoreDeleted'] = false;
      return query;
    }

    /**
     * Fetch all models without filter by deleted_at
     */
    public static withTrashed<Model extends typeof ModelWithSoftDeletes>(
      this: Model
    ): ModelQueryBuilderContract<T, InstanceType<T>> {
      return this.disableIgnore(this.query());
    }

    /**
     * Fetch models only with deleted_at
     */
    public static onlyTrashed<Model extends typeof ModelWithSoftDeletes>(
      this: Model
    ): ModelQueryBuilderContract<Model, InstanceType<Model>> {
      const query = this.query();

      const deletedAtColumn = query.model.$getColumn('deletedAt')?.columnName;
      return this.disableIgnore(query).whereNotNull(`${query.model.table}.${deletedAtColumn}`);
    }

    /**
     * Force delete instance property
     */
    public $forceDelete = false;

    /**
     * Soft deleted property
     */
    @column.dateTime()
    public deletedAt?: DateTime | null;

    /**
     * Computed trashed property
     */
    public get trashed(): boolean {
      return this.deletedAt !== null;
    }

    /**
     * Override default $getQueryFor method
     */
    public $getQueryFor(action: 'insert' | 'update' | 'delete' | 'refresh', client: QueryClientContract): any {
      /**
       * Soft Delete
       */
      const softDelete = async (): Promise<void> => {
        this.deletedAt = DateTime.local();
        await this.save();
      };

      if (action === 'delete' && !this.$forceDelete) {
        return { del: softDelete, delete: softDelete };
      }
      if (action === 'insert') {
        return super.$getQueryFor(action, client);
      }
      return super.$getQueryFor(action, client);
    }

    /**
     * Override default delete method
     */
    public async delete(): Promise<void> {
      await super.delete();
      this.$isDeleted = this.$forceDelete;
    }

    /**
     * Restore model
     */
    public async restore(): Promise<this> {
      if (this.$isDeleted) {
        throw new Exception('Cannot restore a model instance is was force deleted', 500, 'E_MODEL_FORCE_DELETED');
      }
      if (!this.trashed) {
        return this;
      }
      this.deletedAt = null;
      await this.save();

      return this;
    }

    /**
     * Force delete model
     */
    public async forceDelete(): Promise<void> {
      this.$forceDelete = true;
      await this.delete();
    }
  }
  return ModelWithSoftDeletes;
}
