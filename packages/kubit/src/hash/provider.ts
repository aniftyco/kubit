import { ApplicationContract } from '@ioc:Kubit/Application';

export default class HashProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  public register() {
    this.app.container.singleton('Kubit/Hash', () => {
      const config = this.app.container.resolveBinding('Kubit/Config').get('hash', {});
      const { Hash } = require('./Hash');
      return new Hash(this, config);
    });
  }
}
