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

      const { store } = this.app.config.get('cache');
      const Event = this.app.container.use('Kubit/Event');

      switch (store) {
        case 'redis':
          return new CacheManager(
            Event,
            new RedisStore(this.app.container.use('Kubit/Redis'), `${this.app.env.get('APP_NAME', 'kubit-app')}:cache`)
          );
        case 'in-memory':
        default:
          return new CacheManager(Event, new InMemoryStore());
      }
    });
  }
}
