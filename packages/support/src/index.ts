import { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class SupportProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Support', () => {
      const { UsesUuids } = require('./UsesUuids');

      return {
        UsesUuids,
      };
    });
  }
}
