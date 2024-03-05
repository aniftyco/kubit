import { InferConnectionsFromConfig } from 'kubit';

declare module '@ioc:Kubit/Redis' {
  interface RedisConnectionsList extends InferConnectionsFromConfig<typeof import('../config/redis').default> {}
}
