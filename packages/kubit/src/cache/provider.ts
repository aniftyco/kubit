import type { ApplicationContract } from '@ioc:Kubit/Application';

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

      const { driver } = this.app.config.get('cache', { driver: 'in-memory' });
      const Event = this.app.container.use('Kubit/Event');

      switch (driver) {
        case 'redis':
          return new CacheManager(Event, new RedisStore(this.app.container.use('Kubit/Redis')));
        case 'in-memory':
        default:
          return new CacheManager(Event, new InMemoryStore());
      }
    });
  }
}
