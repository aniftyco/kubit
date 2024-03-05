import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

/**
 * Mail provider to register mail specific bindings
 */
export default class MailProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register bindings with the container
   */
  public register() {
    this.app.container.singleton('Kubit/Mail', () => {
      const config = this.app.container.resolveBinding('Kubit/Config').get('mail', {});
      const { MailManager } = require('./Mail/MailManager');
      return new MailManager(this.app, config);
    });
  }

  /**
   * Setup REPL bindings
   */
  public async boot() {
    if (this.app.environment !== 'repl') {
      return;
    }

    this.app.container.withBindings(['Kubit/Repl'], (Repl) => {
      const { defineReplBindings } = require('./Bindings/Repl');
      defineReplBindings(this.app, Repl);
    });
  }

  /**
   * Close all drivers when shutting down the app
   */
  public async shutdown() {
    await this.app.container.resolveBinding('Kubit/Mail').closeAll();
  }
}
