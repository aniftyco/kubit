import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

/**
 * Encryption provider to binding encryption class to the container
 */
export default class EncryptionProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  public register() {
    this.app.container.singleton('Kubit/Encryption', () => {
      const Config = this.app.container.resolveBinding('Kubit/Config');
      const { Encryption } = require('./Encryption');
      return new Encryption({ secret: Config.get('app.appKey') });
    });
  }
}
