import { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * ORM service provider
 */
export default class ORMServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Registers ORM
   */
  private registerORM() {
    this.app.container.singleton('Kubit/ORM', () => {
      const { Adapter } = require('./Adapter');
      const { scope } = require('./Helpers/scope');
      const decorators = require('./Decorators');
      const { BaseModel } = require('./BaseModel');
      const { ModelPaginator } = require('./Paginator');
      const { SnakeCaseNamingStrategy } = require('./NamingStrategies/SnakeCase');

      /**
       * Attaching adapter to the base model. Each model is allowed to define
       * a different adapter.
       */
      BaseModel.$adapter = new Adapter(this.app.container.resolveBinding('Kubit/Database'));
      BaseModel.$container = this.app.container;

      return {
        BaseModel,
        ModelPaginator,
        SnakeCaseNamingStrategy,
        scope,
        ...decorators,
      };
    });
  }

  /**
   * Registers schema class
   */
  private registerFactory() {
    this.app.container.singleton('Kubit/Factory', () => {
      const { FactoryManager } = require('./Factory');
      return new FactoryManager();
    });
  }

  /**
   * Defines REPL bindings
   */
  private defineReplBindings() {
    if (this.app.environment !== 'repl') {
      return;
    }

    this.app.container.withBindings(['Kubit/Repl'], (Repl) => {
      const { defineReplBindings } = require('./Bindings/Repl');
      defineReplBindings(this.app, Repl);
    });
  }

  /**
   * Called when registering providers
   */
  public register(): void {
    this.registerORM();
    this.registerFactory();
  }

  /**
   * Called when all bindings are in place
   */
  public boot(): void {
    this.defineReplBindings();
  }
}
