import type { DisksList } from '@ioc:Kubit/Drive';
import type { ViewContract } from '@ioc:Kubit/View';
import type { RouterContract } from '@ioc:Kubit/Route';
import type { ApplicationContract } from '@ioc:Kubit/Application';
import type { AssetsManagerContract } from '@ioc:Kubit/AssetsManager';
import type { HttpContextConstructorContract } from '@ioc:Kubit/HttpContext';

/**
 * View provider to register view to the application
 */
export default class ViewProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Add globals for resolving routes
   */
  private addRouteGlobal(View: ViewContract, Route: RouterContract) {
    /**
     * Adding `route` global
     */
    View.global('route', (routeIdentifier: string, params?: any, options?: any) => {
      return Route.makeUrl(routeIdentifier, params, options);
    });

    /**
     * Adding `signedRoute` global
     */
    View.global('signedRoute', (routeIdentifier: string, params?: any, options?: any) => {
      return Route.makeSignedUrl(routeIdentifier, params, options);
    });
  }

  /**
   * Share application reference, a config and env variable with the
   * templates.
   */
  private addGlobals(View: ViewContract, Application: ApplicationContract) {
    const Config = Application.container.resolveBinding('Kubit/Config');
    const Env = Application.container.resolveBinding('Kubit/Env');
    const Drive = Application.container.resolveBinding('Kubit/Drive');

    View.global('app', Application);
    View.global('config', (key: string, defaultValue?: any) => Config.get(key, defaultValue));
    View.global('env', (key: string, defaultValue?: any) => Env.get(key, defaultValue));

    View.global('driveUrl', (location: string, disk?: keyof DisksList) => {
      return disk ? (Drive.use(disk) as any).getUrl(location) : Drive.getUrl(location);
    });

    View.global('driveSignedUrl', (location: string, disk?: keyof DisksList) => {
      return disk ? (Drive.use(disk) as any).getSignedUrl(location) : Drive.getSignedUrl(location);
    });
  }

  /**
   * Copy globals exposed by Edge
   */
  private copyEdgeGlobals(View: ViewContract) {
    const { GLOBALS } = require('edge.js');
    Object.keys(GLOBALS).forEach((key) => View.global(key, GLOBALS[key]));
  }

  /**
   * Registering the brisk route to render view directly from the route.
   */
  private registerBriskRoute(Route: RouterContract) {
    Route.BriskRoute.macro('render', function renderView(template: string, data?: any) {
      return this.setHandler(({ view }: { view: ViewContract }) => {
        return view.render(template, data);
      }, 'render');
    });
  }

  /**
   * Registering the http context getter to access an isolated
   * view instance with the request and route.
   */
  private registerHTTPContextGetter(HttpContext: HttpContextConstructorContract, View: ViewContract) {
    HttpContext.getter(
      'view',
      function () {
        return View.share({ request: this.request });
      },
      true
    );
  }

  /**
   * Decide whether or not to cache views. If a user opts to remove
   * the valdation, then `CACHE_VIEWS` will be a string and not
   * a boolean, so we need to handle that case
   */
  private shouldCacheViews(): boolean {
    let cacheViews = this.app.container.resolveBinding('Kubit/Env').get('CACHE_VIEWS');
    if (typeof cacheViews === 'string') {
      cacheViews = cacheViews === 'true';
    }

    return cacheViews;
  }

  /**
   * Register repl binding
   */
  private defineReplBindings() {
    if (this.app.environment !== 'repl') {
      return;
    }

    this.app.container.withBindings(['Kubit/Repl'], (Repl) => {
      const { defineReplBindings } = require('./Bindings/Repl');
      defineReplBindings(this.app, Repl);
    });
  }

  /**
   * Define assets manager bindings
   */
  private defineAssetsManagerBindings(View: ViewContract, AssetsManager: AssetsManagerContract) {
    const { defineAssetsManagerBindings } = require('./Bindings/AssetsManager');
    defineAssetsManagerBindings(View, AssetsManager);
  }

  /**
   * Register view binding
   */
  public register() {
    this.app.container.singleton('Kubit/View', () => {
      const { Edge } = require('edge.js');
      const { Supercharged } = require('edge-supercharged');

      const cacheViews = this.shouldCacheViews();
      const edge = new Edge({ cache: cacheViews });

      /**
       * Mount the views directory
       */
      edge.mount(this.app.viewsPath());

      /**
       * Enable recurring mode when not caching views, so that the
       * edge supercharged can re-scan components on each
       * render call
       */
      edge.use(new Supercharged().wire, { recurring: !cacheViews });

      return edge;
    });
  }

  /**
   * Setup view on boot
   */
  public boot() {
    const View = this.app.container.resolveBinding('Kubit/View');
    const Route = this.app.container.resolveBinding('Kubit/Route');
    const HttpContext = this.app.container.resolveBinding('Kubit/HttpContext');
    const AssetsManager = this.app.container.resolveBinding('Kubit/AssetsManager');

    /**
     * Repl and Assets manager bindings
     */
    this.defineReplBindings();
    this.defineAssetsManagerBindings(View, AssetsManager);

    /**
     * Registering globals
     */
    this.addRouteGlobal(View, Route);
    this.addGlobals(View, this.app);
    this.copyEdgeGlobals(View);

    /**
     * Registering the brisk route
     */
    this.registerBriskRoute(Route);

    /**
     * Registering isolated view renderer with the HTTP context
     */
    this.registerHTTPContextGetter(HttpContext, View);
  }
}
