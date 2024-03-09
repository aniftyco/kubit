import { CacheStoreContract } from '@ioc:Kubit/Cache';

interface InMemoryRecord {
  ttl: string;
  value: string;
}

export class InMemoryStore implements CacheStoreContract {
  private store = new Map<string, InMemoryRecord>();

  public async get<T = any>(key: string): Promise<T | null> {
    const { value = null, ttl = null } = this.store.get(key) || {};

    if (ttl && Date.now() > parseInt(ttl)) {
      this.store.delete(key);
      return null;
    }

    return JSON.parse(value) as T;
  }

  public async getMany<T = any>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get(key)));
  }

  public async put<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    this.store.set(key, {
      value: JSON.stringify(value),
      ttl: ttl ? (Date.now() + ttl).toString() : null,
    });
  }

  public async putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      await this.put(key, value, ttl);
    }
  }

  public async forget(key: string): Promise<boolean> {
    if (this.store.has(key)) {
      this.store.delete(key);

      return true;
    }

    return false;
  }

  public async flush(): Promise<void> {
    this.store.clear();
  }
}
