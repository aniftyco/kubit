/**
 * @kubit/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Middleware' {
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { IocContract } from '@kubit/fold'

  export type DefaultExport<T> = Promise<{ default: T }>

  /**
   * Shape of the middleware class
   */
  export interface MiddlewareConstructorContract {
    new (...args: any[]): {
      handle(ctx: HttpContextContract, next: () => any, ...options: any[]): any
    }
  }

  /**
   * Input middleware node must be function or a string pointing
   * to the IoC container
   */
  export type MiddlewareHandler = string | (() => DefaultExport<MiddlewareConstructorContract>)

  /**
   * Shape of resolved middleware. This information is
   * enough to execute the middleware
   */
  export type ResolvedMiddlewareHandler =
    | {
        type: 'function'
        value: (ctx: HttpContextContract, next: () => void, ...options: any[]) => any
        args: string[]
      }
    | {
        type: 'lazy-import'
        value: Exclude<MiddlewareHandler, string>
        args: string[]
      }
    | {
        type: 'alias' | 'binding'
        namespace: string
        method: string
        args: string[]
      }

  /**
   * Shape of middleware store to store and fetch middleware
   * at runtime
   */
  export interface MiddlewareStoreContract {
    /**
     * Register an array of global middleware. These middleware are read
     * by HTTP server and executed on every request
     */
    register(middleware: MiddlewareHandler[]): this

    /**
     * Register named middleware that can be referenced later on routes
     */
    registerNamed(middleware: { [alias: string]: MiddlewareHandler }): this

    /**
     * Return all middleware registered using [[MiddlewareStore.register]]
     * method
     */
    get(): ResolvedMiddlewareHandler[]

    /**
     * Removes all the global middleware
     */
    clear(): void

    /**
     * Removes all/select named middleware
     */
    clearNamed(names: string[]): void

    /**
     * Returns a single middleware by it's name registered
     * using [[MiddlewareStore.registerNamed]] method.
     */
    getNamed(name: string): null | ResolvedMiddlewareHandler

    /**
     * Invokes a resolved middleware.
     */
    invokeMiddleware(
      middleware: ResolvedMiddlewareHandler,
      params: [HttpContextContract, () => Promise<void>]
    ): Promise<void>
  }

  /**
   * The shape of the middleware store constructor. We default export the
   * constructor, since the store instance must be pulled from the
   * server to register/fetch middleware
   */
  export interface MiddlewareStoreConstructorContract {
    new (container: IocContract): MiddlewareStoreContract
  }

  const MiddlewareStore: MiddlewareStoreConstructorContract
  export default MiddlewareStore
}
