/**
 * @adonisjs/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Decorate context
 */
declare module '@ioc:Adonis/Core/HttpContext' {
  import { ViewRendererContract } from '@ioc:Adonis/Core/View'
  interface HttpContextContract {
    view: ViewRendererContract
  }
}

/**
 * Decorate router
 */
declare module '@ioc:Adonis/Core/Route' {
  interface BriskRouteContract {
    render: (template: string, data?: any) => Exclude<this['route'], null>
  }
}
