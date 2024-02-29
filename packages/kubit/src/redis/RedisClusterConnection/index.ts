import Redis, { Cluster, NodeRole } from 'ioredis';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { RedisClusterConfig } from '@ioc:Kubit/Redis';

import { AbstractConnection } from '../AbstractConnection';
import { ioMethods } from '../ioMethods';

/**
 * Redis cluster connection exposes the API to run Redis commands using `ioredis` as the
 * underlying client. The class abstracts the need of creating and managing multiple
 * pub/sub connections by hand, since it handles that internally by itself.
 */
export class RedisClusterConnection extends AbstractConnection<Cluster> {
  constructor(
    connectionName: string,
    private config: RedisClusterConfig,
    application: ApplicationContract
  ) {
    super(connectionName, application);
    this.ioConnection = new Redis.Cluster(this.config.clusters as any[], this.config.clusterOptions);
    this.proxyConnectionEvents();
  }

  /**
   * Creates the subscriber connection, the [[AbstractConnection]] will
   * invoke this method when first subscription is created.
   */
  protected makeSubscriberConnection() {
    this.ioSubscriberConnection = new Redis.Cluster(this.config.clusters as [], this.config.clusterOptions);
  }

  /**
   * Returns cluster nodes
   */
  public nodes(role?: NodeRole) {
    return this.ioConnection.nodes(role);
  }
}

ioMethods.forEach((method) => {
  RedisClusterConnection.prototype[method] = function redisConnectionProxyFn(...args: any[]) {
    return this.ioConnection[method](...args);
  };
});
