declare module '@ioc:Kubit/ORM' {
  import { DateTime } from 'luxon';

  import { QueryClientContract } from '@ioc:Kubit/Database';
  import { NormalizeConstructor } from '@ioc:Kubit/Helpers';
  import { LucidModel, ModelQueryBuilderContract } from '@ioc:Kubit/ORM';

  export interface SoftDeletesMixin {
    <T extends NormalizeConstructor<LucidModel>>(
      superclass: T
    ): T & {
      ignoreDeleted<Model extends LucidModel & T>(query: ModelQueryBuilderContract<Model, InstanceType<Model>>): void;

      ignoreDeletedPaginate<Model extends LucidModel & T, Result = InstanceType<Model>>([countQuery, query]: [
        ModelQueryBuilderContract<Model, Result>,
        ModelQueryBuilderContract<Model, Result>,
      ]): void;

      /**
       * Disabled ignore deleted of query
       */
      disableIgnore<Model extends LucidModel & T, Result = InstanceType<Model>>(
        this: Model,
        query: ModelQueryBuilderContract<Model, Result>
      ): ModelQueryBuilderContract<Model, Result>;

      /**
       * Fetch all models without filter by deleted_at
       */
      withTrashed<Model extends LucidModel & T, Result = InstanceType<Model>>(
        this: Model
      ): ModelQueryBuilderContract<Model, Result>;

      /**
       * Fetch models only with deleted_at
       */
      onlyTrashed<Model extends LucidModel & T, Result = InstanceType<Model>>(
        this: Model
      ): ModelQueryBuilderContract<Model, Result>;

      new (...args: any[]): {
        $forceDelete: boolean;
        deletedAt: DateTime | null;
        readonly trashed: boolean;
        /**
         * Override default $getQueryFor for soft delete
         */
        $getQueryFor(action: 'insert', client: QueryClientContract): ReturnType<QueryClientContract['insertQuery']>;
        $getQueryFor(
          action: 'update' | 'delete' | 'refresh',
          client: QueryClientContract
        ): ModelQueryBuilderContract<T>;
        /**
         * Override default delete method
         */
        delete(): Promise<void>;
        /**
         * Restore model
         */
        restore(): Promise<any>;
        /**
         * Force delete model
         */
        forceDelete(): Promise<void>;
      };
    };
  }
  export const SoftDeletes: SoftDeletesMixin;
}
