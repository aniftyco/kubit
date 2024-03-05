import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

/**
 * Provider to register shield middleware
 */
export default class ShieldProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  public register() {
    this.app.container.singleton('Kubit/Shield', () => {
      const { ShieldMiddleware } = require('./ShieldMiddleware');
      return ShieldMiddleware;
    });
  }

  public async boot() {
    this.app.container.withBindings(['Kubit/Response'], (Response) => {
      require('./Bindings/Response').default(Response);
    });

    this.app.container.withBindings(['Japa/Preset/ApiRequest', 'Japa/Preset/ApiClient'], (ApiRequest, ApiClient) => {
      const { defineTestsBindings } = require('./Bindings/Tests');
      defineTestsBindings(ApiRequest, ApiClient);
    });
  }
}
