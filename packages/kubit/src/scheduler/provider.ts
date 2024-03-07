import type { ApplicationContract } from '@ioc:Kubit/Application';
import { ServiceProvider } from '../index';

/**
 * Kubit provider for the scheduler
 */
export default class SchedulerProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Scheduler', () => {
      const { default: Scheduler } = require('./Scheduler');

      return new Scheduler(this.app);
    });
  }
}
