import { Exception } from '@poppinss/utils';

/**
 * Raised when trying to inject a primitive value like "StringConstructor"
 * to a class constructor or method
 */
export declare class InvalidInjectionException extends Exception {
  static invoke(value: any, parentName: string, index: number): InvalidInjectionException;
}
