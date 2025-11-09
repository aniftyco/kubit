declare module "kubit:orm" {
  export class Model {
    public $attributes: Record<string, any>;
    public $dirty: Record<string, any>;
    public save(): Promise<void>;
    public destroy(): Promise<void>;

    static find<T extends Model>(
      this: { new (): T },
      id: number
    ): Promise<T | null>;
  }

  export type DecoratorFn = (target: any, property: any) => void;

  export const column: {
    (options?: Record<string, unknown>): DecoratorFn;
    dateTime(options?: Record<string, unknown>): DecoratorFn;
  };

  export type Events = "save" | "create" | "update" | "destroy";

  export const before: {
    (event: Events): DecoratorFn;
  };

  export const after: {
    (event: Events): DecoratorFn;
  };

  export const hasOne: {
    (relatedModel: () => typeof Model): DecoratorFn;
  };

  export type HasOne<T> = T;

  export const hasMany: {
    (relatedModel: () => typeof Model): DecoratorFn;
  };

  export type Collection<T> = T[];

  export type HasMany<T> = Collection<T>;

  export const use: {
    (plugin: (model: typeof Model) => void): DecoratorFn;
  };

  export const SoftDeletes: (model: typeof Model) => void;
}
