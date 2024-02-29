import { BindCallback, IocContract } from '../Contracts';

/**
 * Manages the IoC container bindings
 */
export declare class Bindings {
  private container;
  /**
   * Registered bindings
   */
  private list;
  constructor(container: IocContract);
  /**
   * Find if namespace is a binding
   */
  has(namespace: string): boolean;
  /**
   * Define a binding
   */
  register(binding: string, callback: BindCallback<any, IocContract>, singleton: boolean): this;
  /**
   * Resolve a binding. An exception is raised, if the binding is missing
   */
  resolve(binding: string): any;
}
