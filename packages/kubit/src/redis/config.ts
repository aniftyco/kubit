import { RedisClusterConfig, RedisConnectionConfig } from '@ioc:Kubit/Redis';

/**
 * Expected shape of the config accepted by the "redisConfig"
 * method
 */
export type RedisConfig = {
  connection: keyof RedisConfig['connections'];
  connections: {
    [name: string]: RedisConnectionConfig | RedisClusterConfig;
  };
};

/**
 * Pull connections from the config defined inside the "config/redis.ts"
 * file
 */
export type InferConnectionsFromConfig<T extends RedisConfig> = {
  [K in keyof T['connections']]: T['connections'][K];
};
