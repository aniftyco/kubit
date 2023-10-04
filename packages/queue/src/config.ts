import type { RedisOptions } from 'ioredis';

export interface QueueConfig {
  connection: string | RedisOptions;
}

export const queueConfig = (config: QueueConfig): QueueConfig => config;
