declare module 'kubit' {
  export function defineConfig<T>(config: T): T;
  export function env<T>(key: string, defaultValue: T): T;

  export type Trait = <BaseClass>(base: BaseClass) => void;

  export const use: {
    <T = Trait>(...traits: T[]): ClassDecorator;
  };
}
