import type { ServiceProvider } from 'kubit';

export default class AppProvider implements ServiceProvider {
  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
