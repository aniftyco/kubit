import AdonisProvider from '@adonisjs/core/build/providers/AppProvider.js';

export default class KubitProvider extends AdonisProvider {
  protected registerKubitAliases() {
    // Register Kubit aliased bindings
    this.app.container.singleton('Kubit/Server', () => this.app.container.use('Adonis/Core/Server'));
    this.app.container.singleton('Kubit/Application', () => this.app);
    this.app.container.singleton('Kubit/Env', () => this.app.env);
    this.app.container.singleton('Kubit/Profiler', () => this.app.container.use('Adonis/Core/Profiler'));
    this.app.container.singleton('Kubit/Validator', () => this.app.container.use('Adonis/Core/Validator'));
    this.app.container.singleton('Kubit/Route', () => this.app.container.use('Adonis/Core/Route'));
    this.app.container.singleton('Kubit/Middleware/BodyParser', () => this.app.container.use('Adonis/Core/BodyParser'));
    this.app.container.singleton('Kubit/Middleware/Cors', () => this.app.container.use('Adonis/Core/Cors'));
    this.app.container.singleton('Kubit/Test/Utils', () => this.app.container.use('Adonis/Core/TestUtils'));
    this.app.container.singleton('Kubit/Logger', () => this.app.container.use('Adonis/Core/Logger'));
    this.app.container.singleton('Kubit/Static', () => this.app.container.use('Adonis/Core/Static'));
    this.app.container.singleton('Kubit/HttpExceptionHandler', () =>
      this.app.container.use('Adonis/Core/HttpExceptionHandler')
    );
  }
  public register() {
    super.register();
    this.registerKubitAliases();
  }

  public async boot() {
    super.boot();
  }
}
