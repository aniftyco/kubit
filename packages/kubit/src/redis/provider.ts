import { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * Provider to bind redis to the container
 */
export default class RedisProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register redis health check
   */
  protected registerHealthCheck() {
    /**
     * Do not register healthcheck when not running in web
     * or test mode
     */
    if (!['web', 'test'].includes(this.app.environment)) {
      return;
    }

    this.app.container.withBindings(['Kubit/HealthCheck', 'Kubit/Redis'], (HealthCheck, Redis) => {
      if (Redis.healthChecksEnabled) {
        HealthCheck.addChecker('redis', 'Kubit/Redis');
      }
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

    this.app.container.withBindings(['Kubit/Repl'], (Repl) => {
      const { defineReplBindings } = require('./Bindings/Repl');
      defineReplBindings(this.app, Repl);
    });
  }

  /**
   * Register the redis binding
   */
  public register() {
    this.app.container.singleton('Kubit/Redis', () => {
      const config = this.app.container.resolveBinding('Kubit/Config').get('redis', {});
      const emitter = this.app.container.resolveBinding('Kubit/Event');
      const { RedisManager } = require('./RedisManager');

      return new RedisManager(this.app, config, emitter);
    });
  }

  /**
   * Registering the health check checker with HealthCheck service
   */
  public boot() {
    this.registerHealthCheck();
    this.defineReplBindings();
  }

  /**
   * Gracefully shutdown connections when app goes down
   */
  public async shutdown() {
    const Redis = this.app.container.resolveBinding('Kubit/Redis');
    await Redis.quitAll();
  }
}
