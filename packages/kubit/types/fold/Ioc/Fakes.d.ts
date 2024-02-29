import { FakeCallback, IocContract } from '../Contracts';

/**
 * Manages the container fakes
 */
export declare class Fakes {
  private container;
  /**
   * Registered fakes
   */
  private list;
  constructor(container: IocContract);
  /**
   * Register a fake for a given namespace
   */
  register(namespace: string, callback: FakeCallback<any, IocContract>): this;
  /**
   * Find if namespace has a fake registered
   */
  has(namespace: string): boolean;
  /**
   * Clear all fakes
   */
  clear(): void;
  /**
   * Delete fake for a given namespace
   */
  delete(namespace: string): boolean;
  /**
   * Resolve the fake for a given namespace. An exception is raised if
   * not fake is defined
   */
  resolve(namespace: string, originalValue: any): boolean;
}
