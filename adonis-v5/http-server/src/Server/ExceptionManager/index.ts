/**
 * @kubit/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import { HttpContextContract } from '@ioc:Kubit/HttpContext'
import { ErrorHandler, ResolvedErrorHandler } from '@ioc:Kubit/Server'
import { IocContract, IocResolverContract, IocResolverLookupNode } from '@kubit/fold'

import { useReturnValue } from '../../helpers'

/**
 * Exception manager exposes the API to register custom error handler
 * and invoke it when exceptions are raised during the HTTP
 * lifecycle.
 */
export class ExceptionManager {
  /**
   * Resolved copy of error handler
   */
  private resolvedErrorHandler?: ResolvedErrorHandler

  /**
   * Resolved copy of error reporter
   */
  private resolvedErrorReporter?: IocResolverLookupNode<string>

  /**
   * A reference to ioc resolver to resolve the error handler from
   * the IoC container
   */
  private resolver: IocResolverContract<any>

  constructor(container: IocContract) {
    this.resolver = container.getResolver()
  }

  /**
   * Register a custom error handler
   */
  public registerHandler(handler: ErrorHandler) {
    if (typeof handler === 'string') {
      this.resolvedErrorHandler = this.resolver.resolve(`${handler}.handle`)
      this.resolvedErrorReporter = this.resolver.resolve(`${handler}.report`)
    } else {
      this.resolvedErrorHandler = {
        type: 'function',
        value: handler,
      }
    }
  }

  /**
   * Handle error
   */
  private async handleError(error: any, ctx: HttpContextContract) {
    ctx.response.safeStatus(error.status || 500)

    /*
     * Make response when no error handler has been registered
     */
    if (!this.resolvedErrorHandler) {
      ctx.response.send(error.message)
      return
    }

    /*
     * Invoke the error handler and catch any errors raised by the error
     * handler itself. We don't expect error handlers to raise exceptions.
     * However, during development a broken error handler may raise
     * exceptions.
     */
    try {
      let value: any = null

      if (this.resolvedErrorHandler.type === 'function') {
        value = await this.resolvedErrorHandler.value(error, ctx)
      } else {
        value = await this.resolver.call(this.resolvedErrorHandler, undefined, [error, ctx])
      }

      if (useReturnValue(value, ctx)) {
        ctx.response.send(value)
      }
    } catch (finalError) {
      /*
       * Unexpected block
       */
      ctx.response.status(error.status || 500).send(error.message)
      ctx.logger.fatal(
        finalError,
        'Unexpected exception raised from HTTP ExceptionHandler "handle" method'
      )
    }
  }

  /**
   * Report error when report method exists
   */
  private async reportError(error: any, ctx: HttpContextContract) {
    if (this.resolvedErrorReporter) {
      try {
        await this.resolver.call(this.resolvedErrorReporter, undefined, [error, ctx])
      } catch (finalError) {
        ctx.logger.fatal(
          finalError,
          'Unexpected exception raised from HTTP ExceptionHandler "report" method'
        )
      }
    }
  }

  /**
   * Handle the error
   */
  public async handle(error: any, ctx: HttpContextContract) {
    await this.handleError(error, ctx)
    this.reportError(error, ctx)
  }
}
