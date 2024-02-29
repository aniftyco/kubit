import { Constructor } from '../Contracts';

/**
 * Registrar is used to register and boot the providers
 */
export declare class Registrar {
  private providerConstructorParams;
  private basePath?;
  /**
   * The first level of provider paths provided to the registrar
   */
  private providersPaths;
  /**
   * An array of loaded providers. Their can be more providers than the
   * `_providersPaths` array, since each provider can provide it's
   * own sub providers
   */
  private providers;
  /**
   * Method to instantiate provider instances. One can also defined
   * a custom instantiater function
   */
  private providersInstantiater;
  /**
   * Whether or not the providers can be collected
   */
  private collected;
  constructor(providerConstructorParams: any[], basePath?: string | undefined);
  /**
   * Load the provider by requiring the file from the disk
   * and instantiate it. If ioc container is using ES6
   * imports, then default exports are handled
   * automatically.
   */
  private loadProvider;
  /**
   * Loop's over an array of provider paths and pushes them to the
   * `providers` collection. This collection is later used to
   * register and boot providers
   */
  private collect;
  /**
   * Register an array of provider paths
   */
  useProviders(providersPaths: string[], callback?: <T extends Constructor<any>>(provider: T) => InstanceType<T>): this;
  /**
   * Register all the providers by instantiating them and
   * calling the `register` method.
   *
   * The provider instance will be returned, which can be used
   * to boot them as well.
   */
  register(): Promise<any[]>;
  /**
   * Boot all the providers by calling the `boot` method.
   * Boot methods are called in series.
   */
  boot(): Promise<void>;
  /**
   * Register an boot providers together.
   */
  registerAndBoot(): Promise<any[]>;
}
