import { IocContract } from '../Contracts';

/**
 * Manages the import aliases
 */
export declare class ImportAliases {
  private container;
  /**
   * Registered aliases
   */
  list: {
    [alias: string]: string;
  };
  /**
   * In-memory require cache to speed up lookup calls. Yes, "require"
   * is slow. Check "perf/require.js"
   */
  private requireCache;
  constructor(container: IocContract);
  /**
   * Returns the matching alias for the given namespace
   */
  private getPathAlias;
  /**
   * Returns path for a given alias
   */
  private makeAliasPath;
  /**
   * Register an import alias
   */
  register(absolutePath: string, alias: string): this;
  /**
   * Find if a namespace is part of the import aliases
   */
  has(namespace: string): boolean;
  /**
   * Import the namespace from the registered import aliases.
   */
  resolve(namespace: string): any;
  /**
   * Same as [[resolve]] but uses ES modules
   */
  resolveAsync(namespace: string): Promise<any>;
}
