import { ApplicationContract } from '@ioc:Kubit/Application';

export default class EventProvider {
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
