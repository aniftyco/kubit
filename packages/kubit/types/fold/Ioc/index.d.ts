import { BindCallback, FakeCallback, IocContract, LookupNode } from '../Contracts';
import { IocResolver } from '../Resolver';

export declare class Ioc implements IocContract {
  private fakes;
  private bindings;
  private injector;
  private aliases;
  /**
   * The current state of using proxies
   */
  private usingProxies;
  /**
   * A custom method to trap `ioc.use` and `ioc.make` statements
   */
  private trapCallback;
  /**
   * Define the module type for resolving auto import aliases. Defaults
   * to `cjs`
   */
  module: 'cjs' | 'esm';
  /**
   * Registered aliases. The key is the alias and value is the
   * absolute directory path
   */
  get importAliases(): IocContract['importAliases'];
  /**
   * Detect if the module export value is an esm module
   */
  private isEsm;
  /**
   * Wraps object and class to a proxy to enable the fakes
   * API
   */
  private wrapAsProxy;
  /**
   * Wrap value inside proxy by also inspecting for esm
   * default exports
   */
  private wrapEsmModuleAsProxy;
  /**
   * Makes an instance of a class by injecting dependencies
   */
  private makeRaw;
  /**
   * Makes an instance of a class asynchronously by injecting dependencies
   */
  private makeRawAsync;
  /**
   * Enable/disable proxies. Proxies are mainly required for fakes to
   * work
   */
  useProxies(enable?: boolean): this;
  /**
   * Register a binding with a callback. The callback return value will be
   * used when binding is resolved
   */
  bind(binding: string, callback: BindCallback<any, this>): this;
  /**
   * Same as the [[bind]] method, but registers a singleton only. Singleton's callback
   * is invoked only for the first time and then the cached value is used
   */
  singleton(binding: string, callback: BindCallback<any, this>): this;
  /**
   * Define an import alias
   */
  alias(absolutePath: string, alias: string): this;
  /**
   * Register a fake for a namespace. Fakes works both for "bindings" and "import aliases".
   * Fakes only work when proxies are enabled using "useProxies".
   */
  fake(namespace: string, callback: FakeCallback<any, this>): this;
  /**
   * Clear selected or all the fakes. Calling the method with no arguments
   * will clear all the fakes
   */
  restore(namespace?: string): this;
  /**
   * Find if a fake has been registered for a given namespace
   */
  hasFake(namespace: string): boolean;
  /**
   * Find if a binding exists for a given namespace
   */
  hasBinding(namespace: string): boolean;
  /**
   * Find if a namespace is part of the auto import aliases. Returns false, when namespace
   * is an alias path but has an explicit binding too
   */
  isAliasPath(namespace: string): boolean;
  /**
   * Lookup a namespace. The output contains the complete namespace,
   * along with its type. The type is an "alias" or a "binding".
   *
   * Null is returned when unable to lookup the namespace inside the container
   *
   * Note: This method just checks if a namespace is registered or binding
   *      or can be it resolved from auto import aliases or not. However,
   *      it doesn't check for the module existence on the disk.
   *
   * Optionally you can define a prefix namespace
   * to be used to build the complete namespace. For example:
   *
   * - namespace: UsersController
   * - prefixNamespace: App/Controllers/Http
   * - Output: App/Controllers/Http/UsersController
   *
   * Prefix namespace is ignored for absolute namespaces. For example:
   *
   * - namespace: /App/UsersController
   * - prefixNamespace: App/Controllers/Http
   * - Output: App/UsersController
   */
  lookup(namespace: string | LookupNode<string>, prefixNamespace?: string): null | any;
  /**
   * Same as [[lookup]]. But raises exception instead of returning null
   */
  lookupOrFail(namespace: string | LookupNode<string>, prefixNamespace?: string): LookupNode<string>;
  /**
   * Resolve a binding by invoking the binding factory function. An exception
   * is raised, if the binding namespace is unregistered.
   */
  resolveBinding(binding: string): any;
  /**
   * Import namespace from the auto import aliases. This method assumes you are
   * using native ES modules
   */
  import(namespace: string): Promise<any>;
  /**
   * Same as the "import" method, but uses CJS for requiring the module from its
   * path
   */
  require(namespace: string): any;
  /**
   * The use method looks up a namespace inside both the bindings and the
   * auto import aliases
   */
  use(namespace: string | LookupNode<string>): any;
  /**
   * Same as the [[use]] method, but instead uses ES modules for resolving
   * the auto import aliases
   */
  useAsync(namespace: string | LookupNode<string>): Promise<any>;
  /**
   * Makes an instance of the class by first resolving it.
   */
  make(namespace: LookupNode<string> | any, args?: any[]): any;
  /**
   * Same as the [[make]] method, but instead uses ES modules for resolving
   * the auto import aliases
   */
  makeAsync(namespace: LookupNode<string> | any, args?: any[]): Promise<any>;
  /**
   * Define a callback to be called when all of the container
   * bindings are available.
   *
   * Note: This method is exclusive for bindings and doesn't resolve
   * auto import aliases
   */
  withBindings(namespaces: readonly any[], cb: (...args: any) => void): void;
  /**
   * @deprecated: Use "withBindings" instead
   */
  with(namespaces: readonly any[], cb: (...args: any) => void): void;
  /**
   * Call method on an object and automatically resolve its depdencies
   */
  call(target: any, method: any, args?: any[]): any;
  /**
   * Same as [[call]], but uses ES modules for resolving the auto
   * import aliases
   */
  callAsync(target: any, method: any, args?: any[]): Promise<any>;
  /**
   * Trap container lookup calls. It includes
   *
   * - Ioc.use
   * - Ioc.useAsync
   * - Ioc.make
   * - Ioc.makeAsync
   * - Ioc.require
   * - Ioc.import
   * - Ioc.resolveBinding
   */
  trap(callback: (namespace: string) => any): this;
  /**
   * Returns the resolver instance to resolve Ioc container bindings with
   * little ease. Since, the IocResolver uses an in-memory cache to
   * improve the lookup speed, we suggest keeping a reference to
   * the output of this method to leverage caching
   */
  getResolver(fallbackMethod?: string, rcNamespaceKey?: string, fallbackNamespace?: string): IocResolver;
}
