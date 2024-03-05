import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

export default class EventProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Register `Event emitter` to the container.
   */
  public register() {
    this.app.container.singleton('Kubit/Event', () => {
      const { Emitter } = require('./Emitter');
      return new Emitter(this.app);
    });
  }
}
