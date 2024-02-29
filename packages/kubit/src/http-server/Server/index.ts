import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { Server as HttpsServer } from 'https';
import ms from 'ms';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { EncryptionContract } from '@ioc:Kubit/Encryption';
import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { ProfilerRowContract } from '@ioc:Kubit/Profiler';
import { ErrorHandler, ServerConfig, ServerContract } from '@ioc:Kubit/Server';

import { HttpContext } from '../HttpContext';
import { httpContextLocalStorage, useAsyncLocalStorage, usingAsyncLocalStorage } from '../HttpContext/LocalStorage';
import { MiddlewareStore } from '../MiddlewareStore';
import { Request } from '../Request';
import { Response } from '../Response';
import { Router } from '../Router';
import { ExceptionManager } from './ExceptionManager';
import { Hooks } from './Hooks';
import { PreCompiler } from './PreCompiler';
import { RequestHandler } from './RequestHandler';

/**
 * Server class handles the HTTP requests by using all Adonis micro modules.
 */
export class Server implements ServerContract {
  /**
   * The server itself doesn't create the http server instance. However, the consumer
   * of this class can create one and set the instance for further reference. This
   * is what ignitor does.
   */
  public instance?: HttpServer | HttpsServer;

  /**
   * The middleware store to register global and named middleware
   */
  public middleware = new MiddlewareStore(this.application.container);

  /**
   * The route to register routes
   */
  public router = new Router(this.encryption, (route) => this.precompiler.compileRoute(route));

  /**
   * Server before/after hooks
   */
  public hooks = new Hooks();

  /**
   * Precompiler to set the finalHandler for the route
   */
  private precompiler = new PreCompiler(this.application.container, this.middleware);

  /**
   * Exception manager to handle exceptions
   */
  private exception = new ExceptionManager(this.application.container);

  /**
   * Request handler to handle request after route is found
   */
  private requestHandler = new RequestHandler(this.middleware, this.router);

  constructor(
    private application: ApplicationContract,
    private encryption: EncryptionContract,
    private httpConfig: ServerConfig
  ) {
    /*
     * Pre process config to convert max age string to seconds.
     */
    if (httpConfig.cookie.maxAge && typeof httpConfig.cookie.maxAge === 'string') {
      httpConfig.cookie.maxAge = ms(httpConfig.cookie.maxAge) / 1000;
    }

    useAsyncLocalStorage(httpConfig.useAsyncLocalStorage || false);
  }

  /**
   * Handles HTTP request
   */
  private async runBeforeHooksAndHandler(ctx: HttpContextContract) {
    /*
     * Start with before hooks upfront. If they raise error
     * then execute error handler.
     */
    return this.hooks.executeBefore(ctx).then((shortcircuit) => {
      if (!shortcircuit) {
        return this.requestHandler.handle(ctx);
      }
    });
  }

  /**
   * Returns the profiler row
   */
  private getProfilerRow(request: Request) {
    return this.application.profiler.create('http:request', {
      request_id: request.id(),
      url: request.url(),
      method: request.method(),
    });
  }

  /**
   * Returns the context for the request
   */
  private getContext(request: Request, response: Response, profilerRow: ProfilerRowContract) {
    return new HttpContext(
      request,
      response,
      this.application.logger.child({
        request_id: request.id(),
      }),
      profilerRow
    );
  }

  /**
   * Handle the request
   */
  private async handleRequest(ctx: HttpContext, requestAction: ProfilerRowContract, res: ServerResponse) {
    /*
     * Handle request by executing hooks, request middleware stack
     * and route handler
     */
    try {
      await this.runBeforeHooksAndHandler(ctx);
    } catch (error) {
      await this.exception.handle(error, ctx);
    }

    /*
     * Excute hooks when there are one or more hooks. The `ctx.response.finish`
     * is intentionally inside both the `try` and `catch` blocks as a defensive
     * measure.
     *
     * When we call `response.finish`, it will serialize the response body and may
     * encouter errors while doing so and hence will be catched by the catch
     * block.
     */
    try {
      await this.hooks.executeAfter(ctx);
      requestAction.end({ status_code: res.statusCode });
      ctx.response.finish();
    } catch (error) {
      await this.exception.handle(error, ctx);
      requestAction.end({ status_code: res.statusCode, error });
      ctx.response.finish();
    }
  }

  /**
   * Define custom error handler to handler all errors
   * occurred during HTTP request
   */
  public errorHandler(handler: ErrorHandler): this {
    this.exception.registerHandler(handler);
    return this;
  }

  /**
   * Optimizes internal handlers, based upon the existence of
   * before handlers and global middleware. This helps in
   * increasing throughput by 10%
   */
  public optimize() {
    this.router.commit();
    this.hooks.commit();
    this.requestHandler.commit();
  }

  /**
   * Handles a given HTTP request. This method can be attached to any HTTP
   * server
   */
  public async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const request = new Request(req, res, this.encryption, this.httpConfig);
    const response = new Response(req, res, this.encryption, this.httpConfig, this.router);

    const requestAction = this.getProfilerRow(request);
    const ctx = this.getContext(request, response, requestAction);

    /*
     * Reset accept header when `forceContentNegotiationTo` is defined
     */
    const accept = this.httpConfig.forceContentNegotiationTo;
    if (accept) {
      req.headers['accept'] = typeof accept === 'function' ? accept(ctx) : accept;
    }

    if (usingAsyncLocalStorage) {
      return httpContextLocalStorage.run(ctx, () => this.handleRequest(ctx, requestAction, res));
    } else {
      return this.handleRequest(ctx, requestAction, res);
    }
  }
}
