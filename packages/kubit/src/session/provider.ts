import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

/**
 * Session provider for Kubit
 */
export default class SessionProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register Session Manager
   */
  public register() {
    this.app.container.singleton('Kubit/Session', () => {
      const { SessionManager } = require('./SessionManager');
      return new SessionManager(this.app, this.app.config.get('session', {}));
    });
  }

  /**
   * Register bindings for tests
   */
  protected registerTestsBindings() {
    this.app.container.withBindings(
      ['Japa/Preset/ApiRequest', 'Japa/Preset/ApiResponse', 'Japa/Preset/ApiClient', 'Kubit/Session'],
      (ApiRequest, ApiResponse, ApiClient, Session) => {
        const { defineTestsBindings } = require('./Bindings/Tests');
        defineTestsBindings(ApiRequest, ApiResponse, ApiClient, Session);
      }
    );
  }

  /**
   * Register server bindings
   */
  protected registerServerBindings() {
    this.app.container.withBindings(
      ['Kubit/Server', 'Kubit/HttpContext', 'Kubit/Session'],
      (Server, HttpContext, Session) => {
        const { defineServerBindings } = require('./Bindings/Server');
        defineServerBindings(HttpContext, Server, Session);
      }
    );
  }

  public async boot() {
    this.registerServerBindings();
    this.registerTestsBindings();
  }
}
