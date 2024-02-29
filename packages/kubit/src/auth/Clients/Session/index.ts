/*
 * @adonisjs/auth
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { GuardClientContract, ProviderUserContract, SessionGuardConfig, UserProviderContract } from '@ioc:Kubit/Auth';
import { Exception } from '@poppinss/utils';

/**
 * Session client to login a user during tests using the
 * sessions guard
 */
export class SessionClient implements GuardClientContract<any> {
  constructor(
    public name: string,
    private config: SessionGuardConfig<any>,
    private provider: UserProviderContract<any>
  ) {}

  /**
   * The name of the session key name
   */
  public get sessionKeyName() {
    return `auth_${this.name}`;
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
   * Returns the request data to mark user as logged in
   */
  public async login(user: any) {
    /**
     * Since the login method is exposed to the end user, we cannot expect
     * them to instantiate and return an instance of authenticatable, so
     * we create one manually.
     */
    const providerUser = await this.getUserForLogin(user, this.config.provider.identifierKey);

    /**
     * getUserForLogin raises exception when id is missing, so we can
     * safely assume it is defined
     */
    const id = providerUser.getId()!;

    return {
      session: {
        [this.sessionKeyName]: id,
      },
    };
  }

  /**
   * No need to logout when using session client.
   * Session data is persisted within memory and will
   * be cleared after each test
   */
  public async logout() {}
}
