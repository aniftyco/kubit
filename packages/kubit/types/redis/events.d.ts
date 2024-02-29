declare module '@ioc:Kubit/Event' {
  import { Redis } from 'ioredis';

  import { RedisClusterConnectionContract, RedisConnectionContract } from '@ioc:Kubit/Redis';

  interface EventsList {
    'redis:ready': { connection: RedisClusterConnectionContract | RedisConnectionContract };
    'redis:connect': { connection: RedisClusterConnectionContract | RedisConnectionContract };
    'redis:error': {
      error: any;
      connection: RedisClusterConnectionContract | RedisConnectionContract;
    };
    'redis:end': { connection: RedisClusterConnectionContract | RedisConnectionContract };

    'node:added': { connection: RedisClusterConnectionContract; node: Redis };
    'node:removed': { connection: RedisClusterConnectionContract; node: Redis };
    'node:error': { error: any; connection: RedisClusterConnectionContract; address: string };
  }
}
