/*
 * @adonisjs/auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { GuardsList, ProviderUserContract, UserProviderContract } from '@ioc:Kubit/Auth';
import { Exception } from '@poppinss/utils';

import { InvalidCredentialsException } from '../../Exceptions/InvalidCredentialsException';

/**
 * Base guard with shared abilities
 */
export abstract class BaseGuard<Guard extends keyof GuardsList> {
  constructor(
    public name: Guard,
    public config: GuardsList[Guard]['config'],
    public provider: UserProviderContract<any>
  ) {}

  /**
   * Reference to the name of the guard driver
   */
  public get driver() {
    return this.config.driver;
  }

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
   * A boolean to know if user is loggedin via remember me token
   * or not.
   */
  public viaRemember = false;

  /**
   * Logged in or authenticated user
   */
  public user?: any;

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
   * Lookup user using UID
   */
  private async lookupUsingUid(uid: string): Promise<ProviderUserContract<any>> {
    const providerUser = await this.provider.findByUid(uid);
    if (!providerUser.user) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    return providerUser;
  }

  /**
   * Verify user password
   */
  private async verifyPassword(providerUser: ProviderUserContract<any>, password: string): Promise<void> {
    /**
     * Verify password or raise exception
     */
    const verified = await providerUser.verifyPassword(password);
    if (!verified) {
      throw InvalidCredentialsException.invalidPassword(this.name);
    }
  }

  /**
   * Finds user by their id and returns the provider user instance
   */
  protected async findById(id: string | number) {
    const providerUser = await this.provider.findById(id);
    if (!providerUser.user) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    return providerUser;
  }

  /**
   * Returns the provider user instance from the regular user details. Raises
   * exception when id is missing
   */
  protected async getUserForLogin(user: any, identifierKey: string): Promise<ProviderUserContract<any>> {
    const providerUser = await this.provider.getUserFor(user);

    /**
     * Ensure id exists on the user
     */
    const id = providerUser.getId();
    if (!id) {
      throw new Exception(`Cannot login user. Value of "${identifierKey}" is not defined`);
    }

    return providerUser;
  }

  /**
   * Marks user as logged-in
   */
  protected markUserAsLoggedIn(user: any, authenticated?: boolean, viaRemember?: boolean) {
    this.user = user;
    this.isLoggedOut = false;
    authenticated && (this.isAuthenticated = true);
    viaRemember && (this.viaRemember = true);
  }

  /**
   * Marks the user as logged out
   */
  protected markUserAsLoggedOut() {
    this.isLoggedOut = true;
    this.isAuthenticated = false;
    this.viaRemember = false;
    this.user = null;
  }

  /**
   * Verifies user credentials
   */
  public async verifyCredentials(uid: string, password: string): Promise<any> {
    if (!uid || !password) {
      throw InvalidCredentialsException.invalidUid(this.name);
    }

    const providerUser = await this.lookupUsingUid(uid);
    await this.verifyPassword(providerUser, password);
    return providerUser.user;
  }
}
