declare module '@ioc:Kubit/Cache' {
  export interface CacheStoreContract {
    get<T = any>(key: string): Promise<T | null>;
    getMany<T = any>(keys: string[]): Promise<(T | null)[]>;
    put<T = any>(key: string, value: T, ttl: number): Promise<void>;
    putMany<T = any>(dictionary: { [key: string]: T }, ttl: number): Promise<void>;
    forget(key: string): Promise<boolean>;
    flush(): Promise<void>;
  }

  export interface CacheManagerContract {
    get<T = any>(key: string): Promise<T | null>;
    get<T = any>(key: string, value: T): Promise<T>;
    get<T = any>(key: string, value: T, ttl: number): Promise<T>;

    getMany<T = any>(keys: string[]): Promise<(T | null)[]>;

    put<T = any>(key: string, value: T, ttl?: number): Promise<void>;

    putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<void>;

    clear(): Promise<void>;

    forget(key: string): Promise<boolean>;

    remember<T = any>(key: string, ttl: number, callback: () => Promise<T>): Promise<T>;

    forever<T = any>(key: string, callback: () => Promise<T>): Promise<T>;
  }

  export type CacheDriver = 'in-memory' | 'redis';

  const CacheManager: CacheManagerContract;

  export default CacheManager;
}
