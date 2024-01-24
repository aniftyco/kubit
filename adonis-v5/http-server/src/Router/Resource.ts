/**
 * @kubit/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { Macroable } from 'macroable'
import { singular } from 'pluralize'

import {
  ResourceRouteNames,
  RouteMatchersNode,
  RouteMiddlewareHandler,
  RouteParamMatcher,
  RouteResourceContract,
} from '@ioc:Adonis/Core/Route'
import { string } from '@poppinss/utils/build/helpers'

import { Route } from './Route'

/**
 * Resource route helps in defining multiple conventional routes. The support
 * for shallow routes makes it super easy to avoid deeply nested routes.
 * Learn more http://weblog.jamisbuck.org/2007/2/5/nesting-resources.
 *
 * @example
 * ```ts
 * const resource = new RouteResource('articles', 'ArticlesController')
 * ```
 */
export class RouteResource extends Macroable implements RouteResourceContract {
  protected static macros = {}
  protected static getters = {}

  /**
   * The param names used to create the resource URLs.
   *
   * We need these later when someone explicitly wants to remap
   * param name for a given resource using the "paramFor" method.
   */
  private resourceParamNames: Record<string, string> = {}

  /**
   * A copy of routes that belongs to this resource
   */
  public routes: Route[] = []

  /**
   * Resource name
   */
  private resourceName: string = this.resource
    .split('.')
    .map((token) => string.snakeCase(token))
    .join('.')

  constructor(
    private resource: string,
    private controller: string,
    private globalMatchers: RouteMatchersNode,
    private shallow = false
  ) {
    super()
    this.buildRoutes()
  }

  /**
   * Add a new route for the given pattern, methods and controller action
   */
  private makeRoute(pattern: string, methods: string[], action: ResourceRouteNames) {
    const route = new Route(pattern, methods, `${this.controller}.${action}`, this.globalMatchers)

    route.as(`${this.resourceName}.${action}`)
    this.routes.push(route)
  }

  /**
   * Build routes for the given resource
   */
  private buildRoutes() {
    this.resource = this.resource.replace(/^\//, '').replace(/\/$/, '')

    const resourceTokens = this.resource.split('.')
    const mainResource = resourceTokens.pop()!

    /**
     * The main resource always uses ids
     */
    this.resourceParamNames[mainResource] = ':id'

    const fullUrl = `${resourceTokens
      .map((token) => {
        const paramName = `:${string.snakeCase(singular(token))}_id`
        this.resourceParamNames[token] = paramName

        return `${token}/${paramName}`
      })
      .join('/')}/${mainResource}`

    this.makeRoute(fullUrl, ['GET', 'HEAD'], 'index')
    this.makeRoute(`${fullUrl}/create`, ['GET', 'HEAD'], 'create')
    this.makeRoute(fullUrl, ['POST'], 'store')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id`, ['GET', 'HEAD'], 'show')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id/edit`, ['GET', 'HEAD'], 'edit')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id`, ['PUT', 'PATCH'], 'update')
    this.makeRoute(`${this.shallow ? mainResource : fullUrl}/:id`, ['DELETE'], 'destroy')
  }

  /**
   * Filter the routes based on their partial names
   */
  private filter(names: ResourceRouteNames[], inverse: boolean) {
    return this.routes.filter((route) => {
      const match = names.find((name) => route.name.endsWith(name))
      return inverse ? !match : match
    })
  }

  /**
   * Register only given routes and remove others
   */
  public only(names: ResourceRouteNames[]): this {
    this.filter(names, true).forEach((route) => (route.deleted = true))
    return this
  }

  /**
   * Register all routes, except the one's defined
   */
  public except(names: ResourceRouteNames[]): this {
    this.filter(names, false).forEach((route) => (route.deleted = true))
    return this
  }

  /**
   * Register api only routes. The `create` and `edit` routes, which
   * are meant to show forms will not be registered
   */
  public apiOnly(): this {
    return this.except(['create', 'edit'])
  }

  /**
   * Add middleware to routes inside the resource
   */
  public middleware(
    middleware: {
      [P in ResourceRouteNames]?: RouteMiddlewareHandler | RouteMiddlewareHandler[]
    } & {
      '*'?: RouteMiddlewareHandler | RouteMiddlewareHandler[]
    }
  ): this {
    for (let name in middleware) {
      if (name === '*') {
        this.routes.forEach((one) => one.middleware(middleware[name]))
      } else {
        const route = this.routes.find((one) => one.name.endsWith(name))
        /* istanbul ignore else */
        if (route) {
          route.middleware(middleware[name])
        }
      }
    }

    return this
  }

  /**
   * Define matcher for params inside the resource
   */
  public where(key: string, matcher: RouteParamMatcher): this {
    this.routes.forEach((route) => {
      route.where(key, matcher)
    })

    return this
  }

  /**
   * Define namespace for all the routes inside a given resource
   */
  public namespace(namespace: string): this {
    this.routes.forEach((route) => {
      route.namespace(namespace)
    })

    return this
  }

  /**
   * Set the param name for a given resource
   */
  public paramFor(resource: string, param: string): this {
    const existingParam = this.resourceParamNames[resource]
    this.resourceParamNames[resource] = `:${param}`

    this.routes.forEach((route) => {
      /**
       * Update the pattern for the route with the new param name
       */
      route.setPattern(
        route.getPattern().replace(`${resource}/${existingParam}`, `${resource}/:${param}`)
      )
    })
    return this
  }

  /**
   * Prepend name to the routes names
   */
  public as(name: string): this {
    name = string.snakeCase(name)
    this.routes.forEach((route) => {
      route.as(route.name.replace(this.resourceName, name), false)
    })

    this.resourceName = name
    return this
  }
}
