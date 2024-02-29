/**
 * @kubit/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Macroable } from 'macroable';

import {
  RouteContract,
  RouteHandler,
  RouteJSON,
  RouteMatchersNode,
  RouteMiddlewareHandler,
  RouteParamMatcher,
} from '@ioc:Kubit/Route';
import { types } from '@poppinss/utils/build/helpers';

import { dropSlash } from '../helpers';

/**
 * Route class is used to construct consistent [[RouteDefinition]] using
 * fluent API. An instance of route is usually obtained using the
 * [[Router]] class helper methods.
 *
 * @example
 * ```ts
 * const route = new Route('posts/:id', ['GET'], async function () {
 * })
 *
 * route
 *   .where('id', /^[0-9]+$/)
 *   .middleware(async function () {
 *   })
 * ```
 */
export class Route extends Macroable implements RouteContract {
  protected static macros = {};
  protected static getters = {};

  /**
   * By default the route is part of `root` domain. Root
   * domain is used when no domain is defined
   */
  private routeDomain: string = 'root';

  /**
   * An object of matchers to be forwarded to the
   * store. The matchers list is populated by
   * calling `where` method
   */
  private matchers: RouteMatchersNode = {};

  /**
   * Custom prefixes. Usually added to a group of routes. We keep an array of them
   * since nested groups will want all of them ot concat.
   */
  private prefixes: string[] = [];

  /**
   * An array of middleware. Added using `middleware` function
   */
  private routeMiddleware: RouteMiddlewareHandler[][] = [];

  /**
   * Storing the namespace explicitly set using `route.namespace` method
   */
  private routeNamespace: string;

  /**
   * A boolean to prevent route from getting registered within
   * the [[Store]].
   *
   * This flag must be set before [[Router.commit]] method
   */
  public deleted: boolean = false;

  /**
   * A unique name to lookup the route
   */
  public name: string;

  constructor(
    private pattern: string,
    private methods: string[],
    private handler: RouteHandler,
    private globalMatchers: RouteMatchersNode
  ) {
    super();
  }

  /**
   * Returns an object of param matchers by merging global and local
   * matchers. The local copy is given preference over the global
   * one's
   */
  private getMatchers(): RouteMatchersNode {
    return Object.assign({}, this.globalMatchers, this.matchers);
  }

  /**
   * Returns a normalized pattern string by prefixing the `prefix` (if defined).
   */
  private computePattern(): string {
    const pattern = dropSlash(this.pattern);
    const prefix = this.prefixes
      .slice()
      .reverse()
      .map((one) => dropSlash(one))
      .join('');
    return prefix ? `${prefix}${pattern === '/' ? '' : pattern}` : pattern;
  }

  /**
   * Define Regex matcher for a given param. If a matcher exists, then we do not
   * override that, since the routes inside a group will set matchers before
   * the group, so they should have priority over the route matchers.
   *
   * ```
   * Route.group(() => {
   *   Route.get('/:id', 'handler').where('id', /^[0-9]$/)
   * }).where('id', /[^a-z$]/)
   * ```
   *
   * The `/^[0-9]$/` should win over the matcher defined by the group
   */
  public where(param: string, matcher: RouteParamMatcher): this {
    if (this.matchers[param]) {
      return this;
    }

    if (typeof matcher === 'string') {
      this.matchers[param] = { match: new RegExp(matcher) };
    } else if (types.isRegexp(matcher)) {
      this.matchers[param] = { match: matcher };
    } else {
      this.matchers[param] = matcher;
    }

    return this;
  }

  /**
   * Define prefix for the route. Prefixes will be concated
   * This method is mainly exposed for the [[RouteGroup]]
   */
  public prefix(prefix: string): this {
    this.prefixes.push(prefix);
    return this;
  }

  /**
   * Define a custom domain for the route. Again we do not overwrite the domain
   * unless `overwrite` flag is set to true.
   *
   * This is again done to make route.domain win over route.group.domain
   */
  public domain(domain: string, overwrite: boolean = false): this {
    if (this.routeDomain === 'root' || overwrite) {
      this.routeDomain = domain;
    }
    return this;
  }

  /**
   * Define an array of middleware to be executed on the route. If `prepend`
   * is true, then middleware will be added to start of the existing
   * middleware. The option is exposed for [[RouteGroup]]
   */
  public middleware(middleware: RouteMiddlewareHandler | RouteMiddlewareHandler[], prepend = false): this {
    middleware = Array.isArray(middleware) ? middleware : [middleware];

    if (prepend) {
      this.routeMiddleware.unshift(middleware);
    } else {
      this.routeMiddleware.push(middleware);
    }

    return this;
  }

  /**
   * Give memorizable name to the route. This is helpful, when you
   * want to lookup route defination by it's name.
   *
   * If `prepend` is true, then it will keep on prepending to the existing
   * name. This option is exposed for [[RouteGroup]]
   */
  public as(name: string, prepend = false): this {
    this.name = prepend ? `${name}.${this.name}` : name;
    return this;
  }

  /**
   * Define controller namespace for a given route
   */
  public namespace(namespace: string, overwrite: boolean = false): this {
    if (!this.routeNamespace || overwrite) {
      this.routeNamespace = namespace;
    }
    return this;
  }

  /**
   * Get the route pattern
   */
  public getPattern(): string {
    return this.pattern;
  }

  /**
   * Set the route pattern
   */
  public setPattern(pattern: string): this {
    this.pattern = pattern;
    return this;
  }

  /**
   * Returns [[RouteDefinition]] that can be passed to the [[Store]] for
   * registering the route
   */
  public toJSON(): RouteJSON {
    return {
      domain: this.routeDomain,
      pattern: this.computePattern(),
      matchers: this.getMatchers(),
      meta: {
        namespace: this.routeNamespace,
      },
      name: this.name,
      handler: this.handler,
      methods: this.methods,
      middleware: this.routeMiddleware.flat(),
    };
  }
}
