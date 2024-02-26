/**
 * @kubit/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Decorate context
 */
declare module '@ioc:Kubit/HttpContext' {
  import { ViewRendererContract } from '@ioc:Kubit/View'

  interface HttpContextContract {
    view: ViewRendererContract
  }
}

/**
 * Decorate router
 */
declare module '@ioc:Kubit/Route' {
  interface BriskRouteContract {
    render: (template: string, data?: any) => Exclude<this['route'], null>
  }
}
