import { Queue } from 'bullmq';
import Redis, { RedisOptions } from 'ioredis';

import type { QueueConfig } from './config';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export class QueueManager {
  private queues: Map<string, Queue> = new Map();
  private connection: Redis;

  constructor(
    private app: ApplicationContract,
    private config: QueueConfig
  ) {
    this.connection = new Redis(this.config.connection as RedisOptions);
    this.queues.set('default', new Queue('default', { connection: this.connection }));
  }

  public async dispatch(job: any, payload: any, options: any) {}

  public async process() {}
}
