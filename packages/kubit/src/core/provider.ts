import { resolve } from 'path';

import { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * The application provider that sticks all core components
 * to the container.
 */
export default class AppProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Find if web or test environment
   */
  private isWebOrTestEnvironment = ['web', 'test'].includes(this.app.environment);

  /**
   * Additional providers to load
   */
  public provides = [
    resolve(__dirname, '../encryption/provider'),
    resolve(__dirname, '../events/provider'),
    resolve(__dirname, '../drive/provider'),
    resolve(__dirname, '../hash/provider'),
    resolve(__dirname, '../http-server/provider'),
    resolve(__dirname, '../bodyparser/provider'),
    resolve(__dirname, '../validator/provider'),
    resolve(__dirname, '../view/provider'),
  ];

  /**
   * Register `HttpExceptionHandler` to the container.
   */
  protected registerHttpExceptionHandler() {
    this.app.container.bind('Kubit/HttpExceptionHandler', () => {
      const { HttpExceptionHandler } = require('./HttpExceptionHandler');
      return HttpExceptionHandler;
    });
  }

  /**
   * Registering the health check provider
   */
  protected registerHealthCheck() {
    this.app.container.singleton('Kubit/HealthCheck', () => {
      const { HealthCheck } = require('./HealthCheck');
      return new HealthCheck(this.app);
    });
  }

  /**
   * Registering the assets manager
   */
  protected registerAssetsManager() {
    this.app.container.singleton('Kubit/AssetsManager', () => {
      const { AssetsManager } = require('./AssetsManager');
      const config = this.app.container.resolveBinding('Kubit/Config').get('app.assets', {});
      return new AssetsManager(config, this.app);
    });
  }

  /**
   * Lazy initialize the cors hook, if enabled inside the config
   */
  protected registerCorsHook() {
    /**
     * Do not register hooks when not running in web
     * environment
     */
    if (!this.isWebOrTestEnvironment) {
      return;
    }

    /**
     * Register the cors before hook with the server
     */
    this.app.container.withBindings(['Kubit/Config', 'Kubit/Server'], (Config, Server) => {
      const config = Config.get('cors', {});
      if (!config.enabled) {
        return;
      }

      const { Cors } = require('./Hooks/Cors');
      const cors = new Cors(config);
      Server.hooks.before(cors.handle.bind(cors));
    });
  }

  /**
   * Lazy initialize the static assets hook, if enabled inside the config
   */
  protected registerStaticAssetsHook() {
    /**
     * Do not register hooks when not running in web
     * environment
     */
    if (!this.isWebOrTestEnvironment) {
      return;
    }

    /**
     * Register the cors before hook with the server
     */
    this.app.container.withBindings(
      ['Kubit/Config', 'Kubit/Server', 'Kubit/Application'],
      (Config, Server, Application) => {
        const config = Config.get('static', {});
        if (!config.enabled) {
          return;
        }

        const ServeStatic = require('./Hooks/Static').ServeStatic;
        const serveStatic = new ServeStatic(Application.publicPath(), config);
        Server.hooks.before(serveStatic.handle.bind(serveStatic));
      }
    );
  }

  /**
   * Registers base health checkers
   */
  protected registerHealthCheckers() {
    /**
     * Do not register hooks when not running in web
     * environment
     */
    if (!this.isWebOrTestEnvironment) {
      return;
    }

    this.app.container.withBindings(['Kubit/HealthCheck'], (healthCheck) => {
      require('./HealthCheck/Checkers/Env').default(healthCheck);
      require('./HealthCheck/Checkers/AppKey').default(healthCheck);
    });
  }

  /**
   * Register ace kernel to the container. When the process is started
   * by running an ace command, then the "Kubit/Ace" binding
   * will already be in place and hence we do not overwrite it.
   */
  protected registerAceKernel() {
    if (!this.app.container.hasBinding('Kubit/Ace')) {
      this.app.container.singleton('Kubit/Ace', () => {
        const { Kernel } = require('../ace');
        return new Kernel(this.app);
      });
    }
  }

  /**
   * Register utilities object required during testing
   */
  protected registerTestUtils() {
    this.app.container.singleton('Kubit/TestUtils', () => {
      const { TestUtils } = require('./TestUtils');
      return new TestUtils(this.app);
    });
  }

  /**
   * Define repl bindings
   */
  protected defineReplBindings() {
    /**
     * Do not register repl bindings when not running in "repl"
     * environment
     */
    if (this.app.environment !== 'repl') {
      return;
    }

    /**
     * Define REPL bindings
     */
    this.app.container.withBindings(['Adonis/Addons/Repl'], (Repl) => {
      const { defineReplBindings } = require('./Bindings/Repl');
      defineReplBindings(this.app, Repl);
    });
  }

  /**
   * Define bindings for japa tests
   */
  protected defineTestsBindings() {
    this.app.container.withBindings(
      ['Japa/Preset/ApiRequest', 'Japa/Preset/ApiClient', 'Kubit/CookieClient'],
      (ApiRequest, ApiClient, CookieClient) => {
        const { defineTestsBindings } = require('./Bindings/Tests');
        defineTestsBindings(ApiRequest, ApiClient, CookieClient);
      }
    );
  }

  /**
   * Registering all required bindings to the container
   */
  public register() {
    this.registerHttpExceptionHandler();
    this.registerHealthCheck();
    this.registerAssetsManager();
    this.registerAceKernel();
    this.registerTestUtils();
  }

  /**
   * Register hooks and health checkers on boot
   */
  public boot() {
    this.registerCorsHook();
    this.registerStaticAssetsHook();
    this.registerHealthCheckers();
    this.defineReplBindings();
    this.defineTestsBindings();
  }
}
