import type { Fakes } from './Fakes';
/**
 * Proxies the objects to fallback to fake, when it exists.
 */
export declare class IocProxyObject {
  namespace: string;
  value: any;
  options: Fakes;
  constructor(namespace: string, value: any, options: Fakes);
}
/**
 * Proxies the class constructor to fallback to fake, when it exists.
 */
export declare function IocProxyClass(namespace: string, value: any, options: Fakes): any;
