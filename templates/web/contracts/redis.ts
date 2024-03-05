import { InferConnectionsFromConfig } from 'kubit';

import redisConfig from '../config/redis';

declare module '@ioc:Kubit/Redis' {
  interface RedisConnectionsList extends InferConnectionsFromConfig<typeof redisConfig> {}
}
