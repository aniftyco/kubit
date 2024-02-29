import { Exception } from '@poppinss/utils';

/**
 * Raised when unable to lookup a namespace
 */
export declare class IocLookupException extends Exception {
  static lookupFailed(namespace: string): IocLookupException;
  /**
   * Invalid namespace type
   */
  static invalidNamespace(): IocLookupException;
  /**
   * Fake is missing and yet resolved
   */
  static missingFake(namespace: string): IocLookupException;
}
