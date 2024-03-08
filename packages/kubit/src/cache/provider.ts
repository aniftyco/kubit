import type { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

/**
 * Kubit provider for the cache
 */
export default class CacheProvider implements ServiceProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Cache', () => {});
  }
}
