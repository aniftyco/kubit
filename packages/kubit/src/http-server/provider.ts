import { ApplicationContract } from '@ioc:Kubit/Application';
import { Exception } from '@poppinss/utils';

export default class HttpServerProvider {
  constructor(protected application: ApplicationContract) {}

  /**
   * Validate server config to ensure we start with sane defaults
   */
  private validateServerConfig(config: any) {
    if (!config.cookie || typeof config.cookie !== 'object') {
      throw new Exception('Missing "cookie" config inside the "http" block in "config/app" file.');
    }

    if (typeof config.trustProxy !== 'function') {
      throw new Exception('Invalid "trustProxy" value inside the "http" block in "config/app" file.');
    }
  }

  /**
   * Register request and response bindings to the container
   */
  protected registerRequestResponse() {
    this.application.container.singleton('Kubit/Request', () => {
      return require('./Request').Request;
    });

    this.application.container.singleton('Kubit/Response', () => {
      return require('./Response').Response;
    });
  }

  /**
   * Registering middleware store to the container
   */
  protected registerMiddlewareStore() {
    this.application.container.bind('Kubit/MiddlewareStore', () => {
      return require('./MiddlewareStore').MiddlewareStore;
    });
  }

  /**
   * Registering the HTTP context
   */
  protected registerHTTPContext() {
    this.application.container.bind('Kubit/HttpContext', () => {
      const { HttpContext } = require('./HttpContext');
      HttpContext.app = this.application.container.resolveBinding('Kubit/Application');
      return HttpContext;
    });
  }

  /**
   * Register the HTTP server
   */
  protected registerHttpServer() {
    this.application.container.singleton('Kubit/Server', () => {
      const { Server } = require('./Server');

      const Config = this.application.container.resolveBinding('Kubit/Config');
      const Encryption = this.application.container.resolveBinding('Kubit/Encryption');

      const serverConfig = Config.get('app.http', {});
      this.validateServerConfig(serverConfig);

      return new Server(this.application, Encryption, serverConfig);
    });
  }

  /**
   * Register the router. The router points to the instance of router used
   * by the middleware
   */
  protected registerRouter() {
    this.application.container.singleton('Kubit/Route', () => {
      return this.application.container.resolveBinding('Kubit/Server').router;
    });
  }

  /**
   * Registers the cookie client with the container
   */
  protected registerCookieClient() {
    this.application.container.singleton('Kubit/CookieClient', () => {
      const { CookieClient } = require('./Cookie/Client');
      const Encryption = this.application.container.resolveBinding('Kubit/Encryption');
      return new CookieClient(Encryption);
    });
  }

  /**
   * Registering all bindings
   */
  public register() {
    this.registerRequestResponse();
    this.registerMiddlewareStore();
    this.registerHttpServer();
    this.registerHTTPContext();
    this.registerRouter();
    this.registerCookieClient();
  }
}
