import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

/**
 * Database service provider
 */
export default class DatabaseServiceProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register the database binding
   */
  private registerDatabase() {
    this.app.container.singleton('Kubit/Database', () => {
      const config = this.app.container.resolveBinding('Kubit/Config').get('database', {});
      const Logger = this.app.container.resolveBinding('Kubit/Logger');
      const Profiler = this.app.container.resolveBinding('Kubit/Profiler');
      const Emitter = this.app.container.resolveBinding('Kubit/Event');

      const { Database } = require('./index');
      return new Database(config, Logger, Profiler, Emitter);
    });
  }

  /**
   * Registers schema class
   */
  private registerSchema() {
    this.app.container.singleton('Kubit/Database/Schema', () => {
      const { Schema } = require('./Schema');
      return Schema;
    });
  }

  /**
   * Registers schema class
   */
  private registerBaseSeeder() {
    this.app.container.singleton('Kubit/Database/Seeder', () => {
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

    this.app.container.withBindings(['Kubit/HealthCheck', 'Kubit/Database'], (HealthCheck, Db) => {
      if (Db.hasHealthChecksEnabled) {
        HealthCheck.addChecker('db', 'Kubit/Database');
      }
    });
  }

  /**
   * Register the migrator used for database migration
   */
  private registerMigrator() {
    this.app.container.bind('Kubit/Database/Migrator', () => {
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

    this.app.container.withBindings(['Kubit/Validator', 'Kubit/Database', 'Kubit/Logger'], (Validator, Db, Logger) => {
      const { extendValidator } = require('./Bindings/Validator');
      extendValidator(Validator.validator, Db, Logger);
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
  public register() {
    this.registerDatabase();
    this.registerSchema();
    this.registerBaseSeeder();
    this.registerMigrator();
  }

  /**
   * Called when all bindings are in place
   */
  public async boot() {
    this.registerHealthChecker();
    this.defineValidationRules();
    this.defineReplBindings();
    this.defineTestUtils();
  }

  /**
   * Gracefully close connections during shutdown
   */
  public async shutdown() {
    await this.app.container.resolveBinding('Kubit/Database').manager.closeAll();
  }
}
