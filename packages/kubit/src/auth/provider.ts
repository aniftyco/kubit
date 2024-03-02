import { ApplicationContract } from '@ioc:Kubit/Application';

/**
 * Auth provider to register the auth binding
 */
export default class AuthProvider {
  constructor(protected application: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register auth binding
   */
  public register() {
    this.application.container.singleton('Kubit/Auth', () => {
      const authConfig = this.application.container.resolveBinding('Kubit/Config').get('auth', {});
      const { AuthManager } = require('./AuthManager');
      return new AuthManager(this.application, authConfig);
    });
  }

  /**
   * Sharing the auth object with HTTP context
   */
  protected registerAuthWithHttpContext() {
    this.application.container.withBindings(['Kubit/HttpContext', 'Kubit/Auth'], (HttpContext, Auth) => {
      HttpContext.getter(
        'auth',
        function auth() {
          return Auth.getAuthForRequest(this);
        },
        true
      );
    });
  }

  /**
   * Sharing auth with all the templates
   */
  protected shareAuthWithViews() {
    this.application.container.withBindings(['Kubit/Server', 'Kubit/View'], (Server) => {
      Server.hooks.before(async (ctx) => {
        ctx['view'].share({ auth: ctx.auth });
      });
    });
  }

  /**
   * Register test bindings
   */
  protected registerTestBindings() {
    this.application.container.withBindings(
      ['Japa/Preset/ApiRequest', 'Japa/Preset/ApiClient', 'Kubit/Auth'],
      (ApiRequest, ApiClient, Auth) => {
        const { defineTestsBindings } = require('./Bindings/Tests');
        return defineTestsBindings(ApiRequest, ApiClient, Auth);
      }
    );
  }

  /**
   * Hook into boot to register auth macro
   */
  public async boot() {
    this.registerAuthWithHttpContext();
    this.shareAuthWithViews();
    this.registerTestBindings();
  }
}
