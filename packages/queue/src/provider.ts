import { QueueManager } from './manager';

import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import type { QueueConfig } from './config';

export class QueueProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Queue', () => {
      const config: QueueConfig = this.app.container.resolveBinding('Adonis/Core/Config').get('queue');

      return new QueueManager(this.app, config);
    });
  }
}
