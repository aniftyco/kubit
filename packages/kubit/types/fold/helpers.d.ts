/**
 * Returns a boolean telling if value is an esm module
 * with `export default`.
 */
export declare function isEsm(value: any): boolean;
/**
 * Returns a boolean telling if value is a primitive or object constructor.
 */
export declare function isPrimtiveConstructor(value: any): boolean;
/**
 * Raises error with a message when callback is not
 * a function.
 */
export declare function ensureIsFunction(callback: Function, message: string): void;
