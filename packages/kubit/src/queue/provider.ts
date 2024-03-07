import type { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';
import { BullManager } from './BullManager';

/**
 * Kubit provider for the queue
 */
export default class QueueProvider implements ServiceProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Queue', () => {
      const { BaseJob } = require('./BaseJob');
      const decorators = require('./Decorators');
      const Redis = this.app.container.resolveBinding('Kubit/Redis');
      const Logger = this.app.container.resolveBinding('Kubit/Logger');

      const Queue = new BullManager(this.app, Redis, Logger);

      BaseJob.$queue = Queue;

      return {
        Job: BaseJob,
        Queue,
        ...decorators,
      };
    });
  }
}
