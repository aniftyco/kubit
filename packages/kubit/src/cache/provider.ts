import type { ApplicationContract } from '@ioc:Kubit/Application';

import { CacheConfig, RedisStoreConfig } from '@ioc:Kubit/Cache';

import { ServiceProvider } from '../index';

/**
 * Kubit provider for the cache
 */
export default class CacheProvider implements ServiceProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Cache', () => {
      const { InMemoryStore } = require('./Stores/InMemoryStore');
      const { RedisStore } = require('./Stores/RedisStore');
      const { CacheManager } = require('./CacheManager');

      const { store, ttl = 6000, stores = {} } = this.app.config.get<CacheConfig & { stores: any }>('cache');
      const Event = this.app.container.use('Kubit/Event');

      switch (store) {
        case 'redis': {
          const connection = this.app.container
            .use('Kubit/Redis')
            .connection((stores as RedisStoreConfig['stores']).redis.connection || 'local');
          const store = new RedisStore(connection, `${this.app.env.get('APP_NAME', 'kubit-app')}:cache`);

          return new CacheManager(Event, store, ttl);
        }
        case 'in-memory':
        default:
          return new CacheManager(Event, new InMemoryStore(), ttl);
      }
    });
  }
}
