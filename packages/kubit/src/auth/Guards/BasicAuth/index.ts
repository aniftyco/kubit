import {
  BasicAuthAuthenticateEventData,
  BasicAuthGuardConfig,
  BasicAuthGuardContract,
  UserProviderContract,
} from '@ioc:Kubit/Auth';
import { EmitterContract } from '@ioc:Kubit/Event';
import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { Exception } from '@poppinss/utils';
import { base64 } from '@poppinss/utils/build/helpers';

import { AuthenticationException } from '../../Exceptions/AuthenticationException';
import { BaseGuard } from '../Base';

/**
 * RegExp for basic auth credentials.
 * Copy/pasted from https://github.com/jshttp/basic-auth/blob/master/index.js
 *
 * credentials = auth-scheme 1*SP token68
 * auth-scheme = "Basic" ; case insensitive
 * token68     = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
 */
const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;

/**
 * RegExp for basic auth user/pass
 * Copy/pasted from https://github.com/jshttp/basic-auth/blob/master/index.js
 *
 * user-pass   = userid ":" password
 * userid      = *<TEXT excluding ":">
 * password    = *TEXT
 */
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;

/**
 * Basic auth guard enables user login using basic auth headers.
 */
export class BasicAuthGuard extends BaseGuard<any> implements BasicAuthGuardContract<any, any> {
  constructor(
    name: string,
    config: BasicAuthGuardConfig<any>,
    private emitter: EmitterContract,
    provider: UserProviderContract<any>,
    private ctx: HttpContextContract
  ) {
    super(name, config, provider);
  }

  /**
   * Returns data packet for the authenticate event. Arguments are
   *
   * - The mapping identifier
   * - Logged in user
   * - HTTP context
   */
  private getAuthenticateEventData(user: any): BasicAuthAuthenticateEventData<any> {
    return {
      name: this.name,
      ctx: this.ctx,
      user,
    };
  }

  /**
   * Returns user credentials by parsing the HTTP "Authorization" header
   */
  private getCredentials(): { uid: string; password: string } {
    /**
     * Ensure the "Authorization" header value exists
     */
    const credentials = this.ctx.request.header('Authorization');
    if (!credentials) {
      throw AuthenticationException.invalidBasicCredentials(this.name);
    }

    /**
     * Ensure credentials are in correct format
     */
    const match = CREDENTIALS_REGEXP.exec(credentials);
    if (!match) {
      throw AuthenticationException.invalidBasicCredentials(this.name);
    }

    /**
     * Ensure credentials are base64 encoded
     */
    const decoded = base64.decode(match[1], 'utf-8', true);

    if (!decoded) {
      throw AuthenticationException.invalidBasicCredentials(this.name);
    }

    /**
     * Ensure decoded credentials are in correct format
     */
    const user = USER_PASS_REGEXP.exec(decoded);
    if (!user) {
      throw AuthenticationException.invalidBasicCredentials(this.name);
    }

    return { uid: user[1], password: user[2] };
  }

  /**
   * Returns user for the uid and password.
   */
  private async getUser(uid: string, password: string) {
    try {
      return await this.verifyCredentials(uid, password);
    } catch {
      throw AuthenticationException.invalidBasicCredentials(this.name);
    }
  }

  /**
   * Implemented method to raise exception when someone calls this method
   * without selecting the guard explicitly
   */
  public async attempt(): Promise<any> {
    return this.login();
  }

  /**
   * Implemented method to raise exception when someone calls this method
   * without selecting the guard explicitly
   */
  public async loginViaId(): Promise<void> {
    return this.login();
  }

  /**
   * Implemented method to raise exception when someone calls this method
   * without selecting the guard explicitly
   */
  public async login(): Promise<void> {
    throw new Exception('There is no concept of login in basic auth', 500);
  }

  /**
   * Authenticates the current HTTP request by checking for the HTTP
   * "Authorization" header
   */
  public async authenticate(): Promise<any> {
    if (this.authenticationAttempted) {
      return this.user;
    }

    this.authenticationAttempted = true;

    /**
     * Parse HTTP "Authorization" header to get credentials
     */
    const credentials = this.getCredentials();

    /**
     * Pull user from credentials
     */
    const user = await this.getUser(credentials.uid, credentials.password);

    /**
     * Mark user a logged in
     */
    this.markUserAsLoggedIn(user, true);

    /**
     * Emit event
     */
    this.emitter.emit('adonis:basic:authenticate', this.getAuthenticateEventData(user));

    return this.user;
  }

  /**
   * Same as [[authenticate]] but returns a boolean over raising exceptions
   */
  public async check(): Promise<boolean> {
    try {
      await this.authenticate();
    } catch (error) {
      this.ctx.logger.trace(error, 'Authentication failure');
    }

    return this.isAuthenticated;
  }

  /**
   * Logout by clearing session and cookies
   */
  public async logout() {
    throw new Exception('There is no concept of logout in basic auth', 500);
  }

  /**
   * Serialize toJSON for JSON.stringify
   */
  public toJSON() {
    return {
      isLoggedIn: this.isLoggedIn,
      isGuest: this.isGuest,
      authenticationAttempted: this.authenticationAttempted,
      isAuthenticated: this.isAuthenticated,
      user: this.user,
    };
  }
}
