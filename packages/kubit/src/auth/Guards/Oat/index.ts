import { createHash } from 'crypto';
import { DateTime } from 'luxon';

import {
  OATAuthenticateEventData,
  OATGuardConfig,
  OATGuardContract,
  OATLoginEventData,
  OATLoginOptions,
  OpaqueTokenContract,
  ProviderTokenContract,
  TokenProviderContract,
  UserProviderContract,
} from '@ioc:Kubit/Auth';
import { EmitterContract } from '@ioc:Kubit/Event';
import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { base64, string } from '@poppinss/utils/build/helpers';

import { AuthenticationException } from '../../Exceptions/AuthenticationException';
import { OpaqueToken } from '../../Tokens/OpaqueToken';
import { ProviderToken } from '../../Tokens/ProviderToken';
import { BaseGuard } from '../Base';

/**
 * Exposes the API to generate and authenticate HTTP request using
 * opaque tokens
 */
export class OATGuard extends BaseGuard<any> implements OATGuardContract<any, any> {
  constructor(
    name: string,
    public config: OATGuardConfig<any>,
    private emitter: EmitterContract,
    provider: UserProviderContract<any>,
    private ctx: HttpContextContract,
    public tokenProvider: TokenProviderContract
  ) {
    super(name, config, provider);
  }

  /**
   * Reference to the parsed token
   */
  private parsedToken?: {
    value: string;
    tokenId: string;
  };

  /**
   * Length of the raw token. The hash length will vary
   */
  private tokenLength = 60;

  /**
   * Token type for the persistance store
   */
  private tokenType = this.config.tokenProvider.type || 'opaque_token';

  /**
   * Whether or not the authentication has been attempted
   * for the current request
   */
  public authenticationAttempted = false;

  /**
   * Find if the user has been logged out in the current request
   */
  public isLoggedOut = false;

  /**
   * A boolean to know if user is retrieved by authenticating
   * the current request or not
   */
  public isAuthenticated = false;

  /**
   * Logged in or authenticated user
   */
  public user?: any;

  /**
   * Token fetched as part of the authenticate or the login
   * call
   */
  public token?: ProviderTokenContract;

  /**
   * Accessor to know if user is logged in
   */
  public get isLoggedIn() {
    return !!this.user;
  }

  /**
   * Accessor to know if user is a guest. It is always opposite
   * of [[isLoggedIn]]
   */
  public get isGuest() {
    return !this.isLoggedIn;
  }

  /**
   * Converts value to a sha256 hash
   */
  private generateHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Converts expiry duration to an absolute date/time value
   */
  private getExpiresAtDate(expiresIn?: string | number) {
    if (!expiresIn) {
      return;
    }

    const milliseconds = typeof expiresIn === 'string' ? string.toMs(expiresIn) : expiresIn;
    return DateTime.local().plus({ milliseconds });
  }

  /**
   * Generates a new token + hash for the persistance
   */
  private generateTokenForPersistance(expiresIn?: string | number) {
    const token = string.generateRandom(this.tokenLength);

    return {
      token,
      hash: this.generateHash(token),
      expiresAt: this.getExpiresAtDate(expiresIn),
    };
  }

  /**
   * Returns data packet for the login event. Arguments are
   *
   * - The mapping identifier
   * - Logged in user
   * - HTTP context
   * - API token
   */
  private getLoginEventData(user: any, token: OpaqueTokenContract<any>): OATLoginEventData<any> {
    return {
      name: this.name,
      ctx: this.ctx,
      user,
      token,
    };
  }

  /**
   * Returns data packet for the authenticate event. Arguments are
   *
   * - The mapping identifier
   * - Logged in user
   * - HTTP context
   * - A boolean to tell if logged in viaRemember or not
   */
  private getAuthenticateEventData(user: any, token: ProviderTokenContract): OATAuthenticateEventData<any> {
    return {
      name: this.name,
      ctx: this.ctx,
      user,
      token,
    };
  }

  /**
   * Parses the token received in the request. The method also performs
   * some initial level of sanity checks.
   */
  private parsePublicToken(token: string) {
    const parts = token.split('.');

    /**
     * Ensure the token has two parts
     */
    if (parts.length !== 2) {
      throw AuthenticationException.invalidToken(this.name);
    }

    /**
     * Ensure the first part is a base64 encode id
     */
    const tokenId = base64.urlDecode(parts[0], undefined, true);
    if (!tokenId) {
      throw AuthenticationException.invalidToken(this.name);
    }

    /**
     * Ensure 2nd part of the token has the expected length
     */
    if (parts[1].length !== this.tokenLength) {
      throw AuthenticationException.invalidToken(this.name);
    }

    /**
     * Set parsed token
     */
    this.parsedToken = {
      tokenId,
      value: parts[1],
    };

    return this.parsedToken;
  }

  /**
   * Returns the bearer token
   */
  private getBearerToken(): string {
    /**
     * Ensure the "Authorization" header value exists
     */
    const token = this.ctx.request.header('Authorization');
    if (!token) {
      throw AuthenticationException.invalidToken(this.name);
    }

    /**
     * Ensure that token has minimum of two parts and the first
     * part is a constant string named `bearer`
     */
    const [type, value] = token.split(' ');
    if (!type || type.toLowerCase() !== 'bearer' || !value) {
      throw AuthenticationException.invalidToken(this.name);
    }

    return value;
  }

  /**
   * Returns the token by reading it from the token provider
   */
  private async getProviderToken(tokenId: string, value: string): Promise<ProviderTokenContract> {
    const providerToken = await this.tokenProvider.read(tokenId, this.generateHash(value), this.tokenType);
    if (!providerToken) {
      throw AuthenticationException.invalidToken(this.name);
    }

    return providerToken;
  }

  /**
   * Returns user from the user session id
   */
  private async getUserById(id: string | number) {
    const authenticatable = await this.provider.findById(id);
    if (!authenticatable.user) {
      throw AuthenticationException.invalidToken(this.name);
    }

    return authenticatable;
  }

  /**
   * Verify user credentials and perform login
   */
  public async attempt(uid: string, password: string, options?: OATLoginOptions): Promise<any> {
    const user = await this.verifyCredentials(uid, password);
    return this.login(user, options);
  }

  /**
   * Login user using their id
   */
  public async loginViaId(id: string | number, options?: OATLoginOptions): Promise<any> {
    const providerUser = await this.findById(id);
    return this.login(providerUser.user, options);
  }

  /**
   * Generate token for a user. It is merely an alias for `login`
   */
  public async generate(user: any, options?: OATLoginOptions) {
    return this.login(user, options);
  }

  /**
   * Login a user
   */
  public async login(user: any, options?: OATLoginOptions): Promise<any> {
    /**
     * Normalize options with defaults
     */
    const { expiresIn, name, ...meta } = Object.assign(
      {
        name: 'Opaque Access Token',
      },
      options
    );

    /**
     * Since the login method is not exposed to the end user, we cannot expect
     * them to instantiate and pass an instance of provider user, so we
     * create one manually.
     */
    const providerUser = await this.getUserForLogin(user, this.config.provider.identifierKey);

    /**
     * "getUserForLogin" raises exception when id is missing, so we can
     * safely assume it is defined
     */
    const id = providerUser.getId()!;
    const token = this.generateTokenForPersistance(expiresIn);

    /**
     * Persist token to the database. Make sure that we are always
     * passing the hash to the storage driver
     */
    const providerToken = new ProviderToken(name, token.hash, id, this.tokenType);
    providerToken.expiresAt = token.expiresAt;
    providerToken.meta = meta;
    const tokenId = await this.tokenProvider.write(providerToken);

    /**
     * Construct a new API Token instance
     */
    const apiToken = new OpaqueToken(name, `${base64.urlEncode(tokenId)}.${token.token}`, providerUser.user);
    apiToken.tokenHash = token.hash;
    apiToken.expiresAt = token.expiresAt;
    apiToken.meta = meta || {};

    /**
     * Emit login event. It can be used to track user logins.
     */
    this.emitter.emit('adonis:api:login', this.getLoginEventData(providerUser.user, apiToken));

    /**
     * Marking user as logged in
     */
    this.markUserAsLoggedIn(providerUser.user);
    this.token = providerToken;

    return apiToken;
  }

  /**
   * Authenticates the current HTTP request by checking for the bearer token
   */
  public async authenticate(): Promise<any> {
    /**
     * Return early when authentication has already attempted for
     * the current request
     */
    if (this.authenticationAttempted) {
      return this.user;
    }

    this.authenticationAttempted = true;

    /**
     * Ensure the "Authorization" header value exists
     */
    const token = this.getBearerToken();
    const { tokenId, value } = this.parsePublicToken(token);

    /**
     * Query token and user
     */
    const providerToken = await this.getProviderToken(tokenId, value);
    const providerUser = await this.getUserById(providerToken.userId);

    this.markUserAsLoggedIn(providerUser.user, true);
    this.token = providerToken;
    this.emitter.emit('adonis:api:authenticate', this.getAuthenticateEventData(providerUser.user, this.token));
    return providerUser.user;
  }

  /**
   * Same as [[authenticate]] but returns a boolean over raising exceptions
   */
  public async check(): Promise<boolean> {
    try {
      await this.authenticate();
    } catch (error) {
      /**
       * Throw error when it is not an instance of the authentication
       */
      if (error instanceof AuthenticationException === false) {
        throw error;
      }

      this.ctx.logger.trace(error, 'Authentication failure');
    }

    return this.isAuthenticated;
  }

  /**
   * Alias for the logout method
   */
  public async revoke() {
    return this.logout();
  }

  /**
   * Logout by removing the token from the storage
   */
  public async logout() {
    if (!this.authenticationAttempted) {
      await this.check();
    }

    /**
     * Clean up token from storage
     */
    if (this.parsedToken) {
      await this.tokenProvider.destroy(this.parsedToken.tokenId, this.tokenType);
    }

    this.markUserAsLoggedOut();
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
