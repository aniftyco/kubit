/**
 * Decorate context
 */
declare module '@ioc:Kubit/HttpContext' {
  import { ViewRendererContract } from '@ioc:Kubit/View';

  interface HttpContextContract {
    view: ViewRendererContract;
  }
}

/**
 * Decorate router
 */
declare module '@ioc:Kubit/Route' {
  interface BriskRouteContract {
    render: (template: string, data?: any) => Exclude<this['route'], null>;
  }
}
