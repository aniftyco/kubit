import KubitProvider from 'kubit';

export default class AppProvider extends KubitProvider {
  public register() {
    super.register();
    // Register your own bindings
  }

  public async boot() {
    await super.boot();
    // IoC container is ready
  }

  public async ready() {
    await super.ready();
    // App is ready
  }

  public async shutdown() {
    await super.shutdown();
    // Cleanup, since app is going down
  }
}
