declare module 'kubit' {
  export function defineConfig<T>(config: T): T;
  export function env<T>(key: string, defaultValue: T): T;
}
