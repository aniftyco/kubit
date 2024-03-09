import { CacheManagerContract, CacheStoreContract } from '@ioc:Kubit/Cache';
import { EmitterContract } from '@ioc:Kubit/Event';

const DEFAULT_TTL = 6000;

export class CacheManager implements CacheManagerContract {
  constructor(
    private event: EmitterContract,
    private storage: CacheStoreContract,
    private defaultTtl: number = DEFAULT_TTL
  ) {}

  public async get<T = null>(key: string, callback?: () => Promise<T>): Promise<T | null> {
    const value = await this.storage.get<T>(key);

    if (value === null) {
      this.event.emit('cache:missed', key);

      return await (typeof callback === 'function' ? callback : async () => callback || null).call(undefined);
    }

    this.event.emit('cache:hit', [key, value]);

    return value;
  }

  public async getMany<T = any>(keys: string[]): Promise<T[]> {
    const values = await this.storage.getMany<T>(keys);

    Object.keys(values).forEach((key) => {
      if (values[key] === null) {
        this.event.emit('cache:missed', key);
      } else {
        this.event.emit('cache:hit', [key, values[key]]);
      }
    });

    return values;
  }

  public async put<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    await this.storage.put(key, value, ttl || this.defaultTtl);

    this.event.emit('cache:written', [key, value]);
  }

  public async putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<void> {
    await this.storage.putMany(values, ttl || this.defaultTtl);

    Object.keys(values).forEach((key) => {
      this.event.emit('cache:written', [key, values[key]]);
    });
  }

  public async forget(key: string): Promise<boolean> {
    const result = await this.storage.forget(key);

    if (result) {
      this.event.emit('cache:forgot', key);
    }

    return result;
  }

  public async clear(): Promise<void> {
    await this.storage.flush();
  }

  public async remember<T = any>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
    const value = await this.get<T>(key);

    if (value !== null) {
      return value;
    }

    const newValue = await (typeof callback === 'function' ? callback : async () => callback || null).call(undefined);

    await this.put(key, newValue, ttl);

    return newValue;
  }
}
