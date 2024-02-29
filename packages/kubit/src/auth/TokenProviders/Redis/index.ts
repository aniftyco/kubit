import { ProviderTokenContract, RedisTokenProviderConfig, TokenProviderContract } from '@ioc:Kubit/Auth';
import { RedisClusterConnectionContract, RedisConnectionContract, RedisManagerContract } from '@ioc:Kubit/Redis';
import { Exception } from '@poppinss/utils';
import { cuid, safeEqual } from '@poppinss/utils/build/helpers';

import { ProviderToken } from '../../Tokens/ProviderToken';

/**
 * Shape of the data persisted inside redis
 */
type PersistedToken = {
  name: string;
  token: string;
} & {
  [key: string]: any;
};

/**
 * Redis backed tokens provider.
 */
export class TokenRedisProvider implements TokenProviderContract {
  constructor(
    private config: RedisTokenProviderConfig,
    private redis: RedisManagerContract
  ) {}

  /**
   * Custom connection or query client
   */
  private connection?: string | RedisConnectionContract | RedisClusterConnectionContract;

  /**
   * Returns the singleton instance of the redis connection
   */
  private getRedisConnection(): RedisConnectionContract | RedisClusterConnectionContract {
    /**
     * Use custom connection if defined
     */
    if (this.connection) {
      return typeof this.connection === 'string' ? this.redis.connection(this.connection) : this.connection;
    }

    /**
     * Config must have a connection defined
     */
    if (!this.config.redisConnection) {
      throw new Exception(
        'Missing "redisConnection" property for auth redis provider inside "config/auth" file',
        500,
        'E_INVALID_AUTH_REDIS_CONFIG'
      );
    }

    return this.redis.connection(this.config.redisConnection);
  }

  /**
   * The foreign key column
   */
  private foreignKey = this.config.foreignKey || 'user_id';

  /**
   * Parse the stringified redis token value to an object
   */
  private parseToken(token: string | null): null | PersistedToken {
    if (!token) {
      return null;
    }

    try {
      const tokenRow: any = JSON.parse(token);
      if (!tokenRow.token || !tokenRow.name || !tokenRow[this.foreignKey]) {
        return null;
      }

      return tokenRow;
    } catch {
      return null;
    }
  }

  /**
   * Define custom connection
   */
  public setConnection(connection: string | RedisConnectionContract | RedisClusterConnectionContract): this {
    this.connection = connection;
    return this;
  }

  /**
   * Reads the token using the lookup token id
   */
  public async read(tokenId: string, tokenHash: string, tokenType: string): Promise<ProviderTokenContract | null> {
    /**
     * Find token using id
     */
    const tokenRow = this.parseToken(await this.getRedisConnection().get(`${tokenType}:${tokenId}`));
    if (!tokenRow) {
      return null;
    }

    /**
     * Ensure hash of the user provided value is same as the one inside
     * the database
     */
    if (!safeEqual(tokenRow.token, tokenHash)) {
      return null;
    }

    const { name, [this.foreignKey]: userId, token: value, ...meta } = tokenRow;

    const token = new ProviderToken(name, value, userId, tokenType);
    token.meta = meta;
    return token;
  }

  /**
   * Saves the token and returns the persisted token lookup id, which
   * is a cuid.
   */
  public async write(token: ProviderToken): Promise<string> {
    /**
     * Payload to save to the database
     */
    const payload: PersistedToken = {
      [this.foreignKey]: token.userId,
      name: token.name,
      token: token.tokenHash,
      ...token.meta,
    };

    const ttl = token.expiresAt ? Math.ceil(token.expiresAt.diffNow('seconds').seconds) : 0;
    const tokenId = cuid();

    if (token.expiresAt && ttl <= 0) {
      throw new Exception('The expiry date/time should be in the future', 500, 'E_INVALID_TOKEN_EXPIRY');
    }

    if (token.expiresAt) {
      await this.getRedisConnection().setex(`${token.type}:${tokenId}`, ttl, JSON.stringify(payload));
    } else {
      await this.getRedisConnection().set(`${token.type}:${tokenId}`, JSON.stringify(payload));
    }

    return tokenId;
  }

  /**
   * Removes a given token
   */
  public async destroy(tokenId: string, tokenType: string) {
    await this.getRedisConnection().del(`${tokenType}:${tokenId}`);
  }
}
