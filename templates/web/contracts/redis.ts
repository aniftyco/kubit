/**
 * Contract source: https://git.io/JemcN
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import { InferConnectionsFromConfig } from 'kubit';

import redisConfig from '../config/redis';

declare module '@ioc:Kubit/Redis' {
  interface RedisConnectionsList extends InferConnectionsFromConfig<typeof redisConfig> {}
}
