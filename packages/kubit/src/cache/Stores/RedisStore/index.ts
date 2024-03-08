import { CacheStoreContract } from '@ioc:Kubit/Cache';
import { RedisManagerContract } from '@ioc:Kubit/Redis';

export class RedisStore implements CacheStoreContract {
  constructor(private client: RedisManagerContract) {}

  public async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    return value !== null ? JSON.parse(value) : null;
  }

  public async getMany<T = any>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get(key)));
  }

  public async put<T = any>(key: string, value: T, ttl: number): Promise<void> {
    await this.client.psetex(key, ttl, JSON.stringify(value));
  }

  public async putMany<T = any>(values: Record<string, T>, ttl: number): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      await this.put(key, value, ttl);
    }
  }

  public async forget(key: string): Promise<boolean> {
    const result = await this.client.del(key);

    return Boolean(result);
  }

  public async flush(): Promise<void> {
    await this.client.flushdb();
  }
}
