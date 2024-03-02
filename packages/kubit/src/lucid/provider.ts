import { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * Database service provider
 */
export default class DatabaseServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register the database binding
   */
  private registerDatabase() {
    this.app.container.singleton('Kubit/Lucid/Database', () => {
      const config = this.app.container.resolveBinding('Kubit/Config').get('database', {});
      const Logger = this.app.container.resolveBinding('Kubit/Logger');
      const Profiler = this.app.container.resolveBinding('Kubit/Profiler');
      const Emitter = this.app.container.resolveBinding('Kubit/Event');

      const { Database } = require('./Database');
      return new Database(config, Logger, Profiler, Emitter);
    });
  }

  /**
   * Registers ORM
   */
  private registerOrm() {
    this.app.container.singleton('Kubit/Lucid/Orm', () => {
      const { Adapter } = require('./Orm/Adapter');
      const { scope } = require('./Helpers/scope');
      const decorators = require('./Orm/Decorators');
      const { BaseModel } = require('./Orm/BaseModel');
      const { ModelPaginator } = require('./Orm/Paginator');
      const { SnakeCaseNamingStrategy } = require('./Orm/NamingStrategies/SnakeCase');

      /**
       * Attaching adapter to the base model. Each model is allowed to define
       * a different adapter.
       */
      BaseModel.$adapter = new Adapter(this.app.container.resolveBinding('Kubit/Lucid/Database'));
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
  private registerSchema() {
    this.app.container.singleton('Kubit/Lucid/Schema', () => {
      const { Schema } = require('./Schema');
      return Schema;
    });
  }

  /**
   * Registers schema class
   */
  private registerFactory() {
    this.app.container.singleton('Kubit/Lucid/Factory', () => {
      const { FactoryManager } = require('./Factory');
      return new FactoryManager();
    });
  }

  /**
   * Registers schema class
   */
  private registerBaseSeeder() {
    this.app.container.singleton('Kubit/Lucid/Seeder', () => {
      const { BaseSeeder } = require('./BaseSeeder');
      return BaseSeeder;
    });
  }

  /**
   * Registers the health checker
   */
  private registerHealthChecker() {
    /**
     * Do not register health checks in the repl environment
     */
    if (this.app.environment === 'repl') {
      return;
    }

    this.app.container.withBindings(['Kubit/HealthCheck', 'Kubit/Lucid/Database'], (HealthCheck, Db) => {
      if (Db.hasHealthChecksEnabled) {
        HealthCheck.addChecker('lucid', 'Kubit/Lucid/Database');
      }
    });
  }

  /**
   * Register the migrator used for database migration
   */
  private registerMigrator() {
    this.app.container.bind('Kubit/Lucid/Migrator', () => {
      const { Migrator } = require('./Migrator');
      return Migrator;
    });
  }

  /**
   * Extends the validator by defining validation rules
   */
  private defineValidationRules() {
    /**
     * Do not register validation rules in the "repl" environment
     */
    if (this.app.environment === 'repl') {
      return;
    }

    this.app.container.withBindings(
      ['Kubit/Validator', 'Kubit/Lucid/Database', 'Kubit/Logger'],
      (Validator, Db, Logger) => {
        const { extendValidator } = require('./Bindings/Validator');
        extendValidator(Validator.validator, Db, Logger);
      }
    );
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
   * Define test utilities for database
   */
  private defineTestUtils() {
    this.app.container.withBindings(['Kubit/TestUtils', 'Kubit/Ace'], (testUtils, ace) => {
      const { defineTestUtils } = require('./Bindings/TestUtils');
      return new defineTestUtils(testUtils, ace);
    });
  }

  /**
   * Called when registering providers
   */
  public register(): void {
    this.registerDatabase();
    this.registerOrm();
    this.registerSchema();
    this.registerFactory();
    this.registerBaseSeeder();
    this.registerMigrator();
  }

  /**
   * Called when all bindings are in place
   */
  public boot(): void {
    this.registerHealthChecker();
    this.defineValidationRules();
    this.defineReplBindings();
    this.defineTestUtils();
  }

  /**
   * Gracefully close connections during shutdown
   */
  public async shutdown() {
    await this.app.container.resolveBinding('Kubit/Lucid/Database').manager.closeAll();
  }
}
