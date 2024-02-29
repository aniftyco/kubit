/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AuthContract, AuthManagerContract } from '@ioc:Kubit/Auth';
import { HttpContextContract } from '@ioc:Kubit/HttpContext';

/**
 * Auth class exposes the API to obtain guard instances for a given
 * HTTP request.
 */
export class Auth implements AuthContract {
  /**
   * We keep a per request singleton instances for each instantiated mapping
   */
  private mappingsCache: Map<string, any> = new Map();

  /**
   * The default guard is always the one defined inside the config, until
   * manually overwritten by the user
   */
  public defaultGuard: string = this.manager.defaultGuard;

  constructor(
    private manager: AuthManagerContract,
    private ctx: HttpContextContract
  ) {}

  /**
   * Returns an instance of a named or the default mapping
   */
  public use(mapping?: string) {
    mapping = mapping || this.defaultGuard;

    if (!this.mappingsCache.has(mapping)) {
      this.ctx.logger.trace('instantiating auth mapping', { name: mapping });
      this.mappingsCache.set(mapping, this.manager.makeMapping(this.ctx, mapping));
    }

    return this.mappingsCache.get(mapping)!;
  }

  /**
   * Guard name for the default mapping
   */
  public get name() {
    return this.use().name;
  }

  /**
   * Reference to the logged in user
   */
  public get user() {
    return this.use().user;
  }

  /**
   * Reference to the default guard config
   */
  public get config() {
    return this.use().config;
  }

  /**
   * Find if the user has been logged out in the current request
   */
  public get isLoggedOut() {
    return this.use().isLoggedOut;
  }

  /**
   * A boolean to know if user is a guest or not. It is
   * always opposite of [[isLoggedIn]]
   */
  public get isGuest() {
    return this.use().isGuest;
  }

  /**
   * A boolean to know if user is logged in or not
   */
  public get isLoggedIn() {
    return this.use().isLoggedIn;
  }

  /**
   * A boolean to know if user is retrieved by authenticating
   * the current request or not.
   */
  public get isAuthenticated() {
    return this.use().isAuthenticated;
  }

  /**
   * Whether or not the authentication has been attempted
   * for the current request
   */
  public get authenticationAttempted() {
    return this.use().authenticationAttempted;
  }

  /**
   * Reference to the provider for looking up the user
   */
  public get provider() {
    return this.use().provider;
  }

  /**
   * Verify user credentials.
   */
  public async verifyCredentials(uid: string, password: string) {
    return this.use().verifyCredentials(uid, password);
  }

  /**
   * Attempt to verify user credentials and perform login
   */
  public async attempt(uid: string, password: string, ...args: any[]) {
    return this.use().attempt(uid, password, ...args);
  }

  /**
   * Login a user without any verification
   */
  public async login(user: any, ...args: any[]) {
    return this.use().login(user, ...args);
  }

  /**
   * Login a user using their id
   */
  public async loginViaId(id: string | number, ...args: any[]) {
    return this.use().loginViaId(id, ...args);
  }

  /**
   * Attempts to authenticate the user for the current HTTP request. An exception
   * is raised when unable to do so
   */
  public async authenticate() {
    return this.use().authenticate();
  }

  /**
   * Attempts to authenticate the user for the current HTTP request and supresses
   * exceptions raised by the [[authenticate]] method and returns a boolean
   */
  public async check() {
    return this.use().check();
  }

  /**
   * Logout user
   */
  public async logout(...args: any[]) {
    return this.use().logout(...args);
  }

  /**
   * Serialize toJSON
   */
  public toJSON(): any {
    return {
      defaultGuard: this.defaultGuard,
      guards: [...this.mappingsCache.keys()].reduce((result, key) => {
        result[key] = this.mappingsCache.get(key).toJSON();
        return result;
      }, {}),
    };
  }
}
