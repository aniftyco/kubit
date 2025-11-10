declare module 'kubit:queue' {
  export type PublicPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];

  export type PublicProperties<T> = Partial<Pick<T, PublicPropertyNames<T>>>;

  export class Job {
    public static dispatch<T extends Job>(this: new () => T, props?: PublicProperties<T>): Promise<void>;
    constructor(...args: any[]);
    handle(): Promise<void>;
  }

  export const property: {
    (options?: Record<string, unknown>): PropertyDecorator;
  };
}
