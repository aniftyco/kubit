import { IncomingMessage, ServerResponse } from 'http';
import { Macroable } from 'macroable';
import { Socket } from 'net';
import { inspect } from 'util';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { LoggerContract } from '@ioc:Kubit/Logger';
import { ProfilerRowContract } from '@ioc:Kubit/Profiler';
import { RequestContract } from '@ioc:Kubit/Request';
import { ResponseContract } from '@ioc:Kubit/Response';
import { RouteNode } from '@ioc:Kubit/Route';
import matchit from '@poppinss/matchit';
import { Exception } from '@poppinss/utils';

import { E_INVALID_ALS_ACCESS, E_INVALID_ALS_SCOPE } from '../exceptions.json';
import { processPattern } from '../helpers';
import { Request } from '../Request';
import { Response } from '../Response';
import { httpContextLocalStorage, usingAsyncLocalStorage } from './LocalStorage';

/**
 * Http context is passed to all route handlers, middleware,
 * error handler and server hooks.
 */
export class HttpContext extends Macroable {
  /**
   * Set inside the provider
   */
  public static app: ApplicationContract;

  /**
   * Find if async localstorage is enabled for HTTP requests
   * or not
   */
  public static get usingAsyncLocalStorage() {
    return usingAsyncLocalStorage;
  }

  /**
   * Get access to the HTTP context. Available only when
   * "usingAsyncLocalStorage" is true
   */
  public static get(): HttpContextContract | null {
    if (!usingAsyncLocalStorage) {
      return null;
    }

    return httpContextLocalStorage.getStore() || null;
  }

  /**
   * Get the HttpContext instance or raise an exception if not
   * available
   */
  public static getOrFail(): HttpContextContract {
    /**
     * Localstorage is not enabled
     */
    if (!usingAsyncLocalStorage) {
      const error = new Exception(E_INVALID_ALS_ACCESS.message, E_INVALID_ALS_ACCESS.status, E_INVALID_ALS_ACCESS.code);
      error.help = E_INVALID_ALS_ACCESS.help.join('\n');
      throw error;
    }

    const store = this.get();

    /**
     * Store is not accessible
     */
    if (!store) {
      const error = new Exception(E_INVALID_ALS_SCOPE.message, E_INVALID_ALS_SCOPE.status, E_INVALID_ALS_SCOPE.code);
      error.help = E_INVALID_ALS_SCOPE.help.join('\n');
      throw error;
    }

    return store;
  }

  /**
   * Run a method that doesn't have access to HTTP context from
   * the async local storage.
   */
  public static runOutsideContext<T>(callback: (...args: any[]) => T, ...args: any[]): T {
    return httpContextLocalStorage.exit(callback, ...args);
  }

  /**
   * A unique key for the current route
   */
  public routeKey: string;

  /**
   * Route params
   */
  public params: Record<string, any> = {};

  /**
   * Route subdomains
   */
  public subdomains: Record<string, any> = {};

  /**
   * Reference to the current route. Not available inside
   * server hooks
   */
  public route?: RouteNode & { params: string[] };

  /**
   * Required by macroable
   */
  protected static macros = {};
  protected static getters = {};

  constructor(
    public request: RequestContract,
    public response: ResponseContract,
    public logger: LoggerContract,
    public profiler: ProfilerRowContract
  ) {
    super();
    /*
     * Creating the circular reference. We do this, since request and response
     * are meant to be extended and at times people would want to access
     * other ctx properties like `logger`, `profiler` inside those
     * extended methods.
     */
    this.request.ctx = this as any;
    this.response.ctx = this as any;
  }

  /**
   * A helper to see top level properties on the context object
   */
  public inspect() {
    return inspect(this, false, 1, true);
  }

  /**
   * Creates a new fake context instance for a given route. The method is
   * meant to be used inside an Kubit application since it relies
   * directly on the IoC container.
   */
  public static create(
    routePattern: string,
    routeParams: Record<string, any>,
    req?: IncomingMessage,
    res?: ServerResponse
  ) {
    const Router = HttpContext.app.container.resolveBinding('Kubit/Route');
    const Encryption = HttpContext.app.container.resolveBinding('Kubit/Encryption');
    const serverConfig = HttpContext.app.container.resolveBinding('Kubit/Config').get('app.http', {});

    req = req || new IncomingMessage(new Socket());
    res = res || new ServerResponse(req);

    /*
     * Creating the url from the router pattern and params. Only
     * when actual URL isn't defined.
     */
    req.url = req.url || processPattern(routePattern, routeParams);

    /*
     * Creating new request instance
     */
    const request = new Request(req, res, Encryption, {
      allowMethodSpoofing: serverConfig.allowMethodSpoofing,
      subdomainOffset: serverConfig.subdomainOffset,
      trustProxy: serverConfig.trustProxy,
      generateRequestId: serverConfig.generateRequestId,
    });

    /*
     * Creating new response instance
     */
    const response = new Response(
      req,
      res,
      Encryption,
      {
        etag: serverConfig.etag,
        cookie: serverConfig.cookie,
        jsonpCallbackName: serverConfig.jsonpCallbackName,
      },
      Router
    );

    /*
     * Creating new ctx instance
     */
    const ctx = new HttpContext(
      request as any,
      response as any,
      this.app.logger.child({}),
      this.app.profiler.create('http:context')
    );

    /*
     * Attaching route to the ctx
     */
    ctx.route = {
      pattern: routePattern,
      middleware: [],
      handler: async () => 'handled',
      meta: {},
      params: matchit
        .parse(routePattern, {})
        .filter((token) => [1, 3].includes(token.type))
        .map((token) => token.val),
    };

    /*
     * Defining route key
     */
    ctx.routeKey = `${request.method() || 'GET'}-${ctx.route.pattern}`;

    /*
     * Attaching params to the ctx
     */
    ctx.params = routeParams;

    /**
     * Set params on the request
     */
    ctx.request.updateParams(routeParams);

    return ctx;
  }
}
