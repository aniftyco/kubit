import { IocContract, IocResolverContract, IocResolverLookupNode } from '../Contracts';

/**
 * Exposes the API to resolve and call bindings from the IoC container. The resolver
 * internally caches the IoC container lookup nodes to boost performance.
 */
export declare class IocResolver implements IocResolverContract<any> {
  private container;
  private fallbackMethod?;
  private rcNamespaceKey?;
  private fallbackNamespace?;
  private lookupCache;
  /**
   * The namespace that will be used as a prefix when resolving
   * bindings
   */
  private prefixNamespace;
  constructor(
    container: IocContract,
    fallbackMethod?: string | undefined,
    rcNamespaceKey?: string | undefined,
    fallbackNamespace?: string | undefined
  );
  /**
   * Returns the prefix namespace by giving preference to the
   * `.adonisrc.json` file
   */
  private getPrefixNamespace;
  /**
   * Resolves the namespace and returns it's lookup node
   */
  resolve(namespace: string, prefixNamespace?: string | undefined): IocResolverLookupNode<string>;
  /**
   * Calls the namespace.method expression with any arguments that needs to
   * be passed. Also supports type-hinting dependencies.
   */
  call(
    namespace: string | IocResolverLookupNode<string>,
    prefixNamespace?: string,
    args?: any[] | ((instance: any) => any[])
  ): Promise<any>;
}
