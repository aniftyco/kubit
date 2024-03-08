import { CacheStoreContract } from '@ioc:Kubit/Cache';

interface InMemoryRecord {
  ttl: string;
  value: string;
}

type Store = {
  records: Map<string, InMemoryRecord>;
  tags: Map<string, string[]>;
};

export class InMemoryStore implements CacheStoreContract {
  private store: Store = {
    records: new Map<string, InMemoryRecord>(),
    tags: new Map<string, string[]>(),
  };

  public async get<T = any>(key: string): Promise<T | null> {
    const { value = null, ttl = null } = this.store.records.get(key);

    if (ttl && Date.now() > parseInt(ttl)) {
      this.store.records.delete(key);
      return null;
    }

    return value as T;
  }

  public async getMany<T = any>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get(key)));
  }

  public async put<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    this.store.records.set(key, {
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
    if (this.store.records.has(key)) {
      this.store.records.delete(key);

      return true;
    }

    return false;
  }

  public async flush(): Promise<void> {
    this.store.records.clear();
  }
}
