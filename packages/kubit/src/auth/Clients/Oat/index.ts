import { createHash } from 'crypto';
import { DateTime } from 'luxon';

import {
  ClientRequestData,
  OATClientContract,
  OATGuardConfig,
  OATLoginOptions,
  ProviderUserContract,
  TokenProviderContract,
  UserProviderContract,
} from '@ioc:Kubit/Auth';
import { Exception } from '@poppinss/utils';
import { base64, string } from '@poppinss/utils/build/helpers';

import { ProviderToken } from '../../Tokens/ProviderToken';

/**
 * OAT client to login a user during tests using the
 * opaque tokens guard
 */
export class OATClient implements OATClientContract<any> {
  constructor(
    public name: string,
    public config: OATGuardConfig<any>,
    private provider: UserProviderContract<any>,
    public tokenProvider: TokenProviderContract
  ) {}

  /**
   * Token generated during the login call
   */
  private tokenId?: string;

  /**
   * Length of the raw token. The hash length will vary
   */
  private tokenLength = 60;

  /**
   * Token type for the persistance store
   */
  private tokenType = this.config.tokenProvider.type || 'opaque_token';

  /**
   * Returns the provider user instance from the regular user details. Raises
   * exception when id is missing
   */
  private async getUserForLogin(user: any, identifierKey: string): Promise<ProviderUserContract<any>> {
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
   * Returns the request data to mark user as logged in
   */
  public async login(user: any, options?: OATLoginOptions): Promise<ClientRequestData> {
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
    this.tokenId = await this.tokenProvider.write(providerToken);

    return {
      headers: {
        Authorization: `Bearer ${base64.urlEncode(this.tokenId)}.${token.token}`,
      },
    };
  }

  /**
   * Logout user
   */
  public async logout() {
    if (this.tokenId) {
      await this.tokenProvider.destroy(this.tokenId, this.tokenType);
    }
  }
}
