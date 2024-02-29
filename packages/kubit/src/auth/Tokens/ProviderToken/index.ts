import { DateTime } from 'luxon';

import { ProviderTokenContract } from '@ioc:Kubit/Auth';

/**
 * Token returned and accepted by the token providers
 */
export class ProviderToken implements ProviderTokenContract {
  /**
   * Expiry date
   */
  public expiresAt?: DateTime;

  /**
   * All other token details
   */
  public meta?: any;

  constructor(
    public name: string, // Name associated with the token
    public tokenHash: string, // The hash to persist
    public userId: string | number, // The user for which the token is generated
    public type: string // The type of the token.
  ) {}
}
