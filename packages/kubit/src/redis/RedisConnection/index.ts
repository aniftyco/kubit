import Redis, { RedisOptions } from 'ioredis';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { RedisConnectionConfig } from '@ioc:Kubit/Redis';

import { AbstractConnection } from '../AbstractConnection';
import { ioMethods } from '../ioMethods';

/**
 * Redis connection exposes the API to run Redis commands using `ioredis` as the
 * underlying client. The class abstracts the need of creating and managing
 * multiple pub/sub connections by hand, since it handles that internally
 * by itself.
 */
export class RedisConnection extends AbstractConnection<Redis> {
  private config: RedisOptions;

  constructor(connectionName: string, config: RedisConnectionConfig, application: ApplicationContract) {
    super(connectionName, application);
    this.config = this.normalizeConfig(config);

    this.ioConnection = new Redis(this.config);
    this.proxyConnectionEvents();
  }

  /**
   * Normalizes config option to be compatible with IORedis
   */
  private normalizeConfig(config: RedisConnectionConfig): RedisOptions {
    if (typeof config.port === 'string') {
      config.port = Number(config.port);
    }
    return config as RedisOptions;
  }

  /**
   * Creates the subscriber connection, the [[AbstractConnection]] will
   * invoke this method when first subscription is created.
   */
  protected makeSubscriberConnection() {
    this.ioSubscriberConnection = new Redis(this.config);
  }
}

/**
 * Since types in Kubit are derived from interfaces, we take the leverage
 * of dynamically adding redis methods to the class prototype.
 */
ioMethods.forEach((method) => {
  RedisConnection.prototype[method] = function redisConnectionProxyFn(...args: any[]) {
    return this.ioConnection[method](...args);
  };
});
