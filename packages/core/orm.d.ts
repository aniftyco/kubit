declare module 'kubit:orm' {
  export class Model {
    public $attributes: Record<string, any>;
    public $dirty: Record<string, any>;
    public save(): Promise<void>;
    public destroy(): Promise<void>;

    static find<T extends Model>(this: { new (): T }, id: number): Promise<T | null>;
  }

  export const column: {
    (options?: Record<string, unknown>): PropertyDecorator;
    dateTime(options?: Record<string, unknown>): PropertyDecorator;
  };

  export type Events = 'save' | 'create' | 'update' | 'destroy';

  export const before: {
    (event: Events): PropertyDecorator;
  };

  export const after: {
    (event: Events): PropertyDecorator;
  };

  export const hasOne: {
    (relatedModel: () => typeof Model): PropertyDecorator;
  };

  export type HasOne<T> = T;

  export const hasMany: {
    (relatedModel: () => typeof Model): PropertyDecorator;
  };

  export type Collection<T> = T[];

  export type HasMany<T> = Collection<T>;

  export const SoftDeletes: (model: typeof Model) => void;
}
