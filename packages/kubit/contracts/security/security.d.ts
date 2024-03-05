declare module '@ioc:Kubit/Security' {
  import { ContentSecurityPolicyOptions } from 'helmet-csp';

  import { ApplicationContract } from '@ioc:Kubit/Application';
  import { HttpContextContract } from '@ioc:Kubit/HttpContext';
  import { CookieOptions } from '@ioc:Kubit/Response';

  /**
   * Config for `X-Frame-Options` header
   */
  export type XFrameOptions =
    | {
        enabled: boolean;
        action?: 'DENY' | 'SAMEORIGIN';
      }
    | {
        enabled: boolean;
        action?: 'ALLOW-FROM';
        domain: string;
      };

  /**
   * Config for X-Content-Type-Options
   */
  export type ContentTypeSniffingOptions = {
    enabled: boolean;
  };

  /**
   * Config for HTTP Strict Transport Security (HSTS)
   */
  export type HstsOptions = {
    enabled: boolean;
    maxAge?: string | number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  /**
   * Config for X-DNS-Prefetch-Control
   */
  export type DnsPrefetchOptions = {
    enabled: boolean;
    allow?: boolean;
  };

  /**
   * Config for working with CSP
   */
  export type CspOptions = { enabled: boolean } & ContentSecurityPolicyOptions;

  /**
   * Config for working with CSRF options
   */
  export type CsrfOptions = {
    enabled: boolean;
    exceptRoutes?: string[] | ((ctx: HttpContextContract) => boolean);
    enableXsrfCookie?: boolean;
    methods?: ReadonlyArray<string>;
    cookieOptions?: Partial<CookieOptions>;
  };

  /**
   * Shield config file types
   */
  export type SecurityConfig = {
    xFrame: XFrameOptions;
    contentTypeSniffing: ContentTypeSniffingOptions;
    hsts: HstsOptions;
    dnsPrefetch: DnsPrefetchOptions;
    csp: CspOptions;
    csrf: CsrfOptions;
  };

  /**
   * Shape of the security middleware class constructor
   */
  export interface SecurityMiddlewareContract {
    new (application: ApplicationContract): {
      handle(ctx: HttpContextContract, next: () => Promise<void>): any;
    };
  }

  const SecurityMiddleware: SecurityMiddlewareContract;
  export default SecurityMiddleware;
}
