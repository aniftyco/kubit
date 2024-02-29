import { IocContract } from '../Contracts';

/**
 * Exposes the API to injecting dependencies to a class or a method
 */
export declare class Injector {
  private container;
  constructor(container: IocContract);
  /**
   * Resolves the injections to be injected to a method or the
   * class constructor
   */
  private resolve;
  /**
   * Resolves the injections to be injected to a method or the
   * class constructor
   */
  private resolveAsync;
  /**
   * Find if the value can be instantiated
   */
  private isNewable;
  /**
   * Get injections for a given property from the target
   */
  private getInjections;
  /**
   * Inject dependencies to the constructor of the class
   */
  make(target: any, runtimeValues: any[]): any;
  /**
   * Inject dependencies asynchronously to the constructor of the class
   */
  makeAsync(target: any, runtimeValues: any[]): Promise<any>;
  /**
   * Injects dependencies to the class method
   */
  call(target: any, method: string, runtimeValues: any[]): any;
  /**
   * Injects dependencies asynchronously to the class method
   */
  callAsync(target: any, method: string, runtimeValues: any[]): Promise<any>;
}
