declare module '@ioc:Kubit/ORM' {
  import { SimplePaginatorMetaKeys } from '@ioc:Kubit/Database';

  export const SnakeCaseNamingStrategy: {
    new (): NamingStrategyContract;
  };
  export const scope: ScopeFn;
  export const BaseModel: LucidModel;
  export const Model: LucidModel;

  /**
   * Relationships
   */
  export const hasOne: HasOneDecorator;
  export const belongsTo: BelongsToDecorator;
  export const hasMany: HasManyDecorator;
  export const manyToMany: ManyToManyDecorator;
  export const hasManyThrough: HasManyThroughDecorator;

  /**
   * Hooks
   */
  export const beforeSave: HooksDecorator;
  export const afterSave: HooksDecorator;
  export const beforeCreate: HooksDecorator;
  export const afterCreate: HooksDecorator;
  export const beforeUpdate: HooksDecorator;
  export const afterUpdate: HooksDecorator;
  export const beforeDelete: HooksDecorator;
  export const afterDelete: HooksDecorator;
  export const beforeFind: HooksDecorator;
  export const afterFind: HooksDecorator;
  export const beforeFetch: HooksDecorator;
  export const afterFetch: HooksDecorator;
  export const beforePaginate: HooksDecorator;
  export const afterPaginate: HooksDecorator;
  export const ModelPaginator: {
    namingStrategy: {
      paginationMetaKeys(): SimplePaginatorMetaKeys;
    };
    new <Row extends LucidRow>(
      total: number,
      perPage: number,
      currentPage: number,
      ...rows: Row[]
    ): ModelPaginatorContract<Row>;
  };

  /**
   * Columns and computed
   */
  export const column: ColumnDecorator & {
    date: DateColumnDecorator;
    dateTime: DateTimeColumnDecorator;
  };
  export const computed: ComputedDecorator;
}
