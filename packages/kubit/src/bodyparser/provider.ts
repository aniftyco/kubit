import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

export default class BodyParserProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}

  public static needsApplication = true;

  /**
   * Registers the bodyparser middleware namespace to the container.
   */
  public register() {
    this.app.container.bind('Kubit/BodyParser', () => {
      const { BodyParserMiddleware } = require('./BodyParser/index');
      return BodyParserMiddleware;
    });
  }

  /**
   * Adding the `file` macro to add support for reading request files.
   */
  public async boot() {
    const { default: extendRequest } = require('./Bindings/Request');
    extendRequest(this.app.container.resolveBinding('Kubit/Request'));
  }
}
