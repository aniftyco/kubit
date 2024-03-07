import { Queue, Worker } from 'bullmq';

import { BaseJob } from '../BaseJob';

import type { JobsOptions, ConnectionOptions } from 'bullmq';
import type { RedisManagerContract, RedisConnectionContract, RedisClusterConnectionContract } from '@ioc:Kubit/Redis';
import type { LoggerContract } from '@ioc:Kubit/Logger';
import type { ApplicationContract } from '@ioc:Kubit/Application';
import type { DataForJob, JobHandlerContract, QueueContract } from '@ioc:Kubit/Queue';

export class BullManager implements QueueContract {
  private connection: RedisConnectionContract | RedisClusterConnectionContract;
  private options: Record<string, any> = {};
  private queues: Map<string, Queue> = new Map();

  constructor(
    private app: ApplicationContract,
    private manager: RedisManagerContract,
    private logger: LoggerContract
  ) {
    const { connection, ...options } = this.app.config.get('queue', { connection: 'local' });
    this.connection = this.manager.connection(connection);
    this.options = options;

    this.queues.set(
      'default',
      new Queue('default', {
        connection: this.connection as ConnectionOptions,
        ...this.options,
      })
    );
  }

  public dispatch(job: string, payload: DataForJob<string>, options: JobsOptions & { queueName?: string } = {}) {
    const queueName = options.queueName || 'default';

    if (!this.queues.has(queueName)) {
      this.queues.set(
        queueName,
        new Queue(queueName, {
          connection: this.connection as ConnectionOptions,
          ...this.options,
        })
      );
    }

    return this.queues.get(queueName)!.add(job, payload, {
      ...this.options,
      ...options,
    });
  }

  private async prepareJobHandler(instance: JobHandlerContract, payload: any): Promise<void> {
    const Job = instance.constructor as typeof BaseJob;

    Object.keys(payload).forEach((key) => {
      const prop = Job.$getProp(key);
      const value = typeof prop.prepare === 'function' ? prop.prepare(payload[key], key, instance) : payload[key];

      instance[prop.propName] = value;
    });

    return instance.handle();
  }

  public async process({ queueName }: { queueName?: string }) {
    this.logger.info(`Queue [${queueName || 'default'}] processing started...`);

    let worker = new Worker(
      queueName || 'default',
      async (job) => {
        try {
          const instance = this.app.container.make(`@app/Jobs/${job.name}`) as JobHandlerContract;

          this.logger.info(`Job ${job.name} started`);

          await this.prepareJobHandler(instance, job.data);

          this.logger.info(`Job ${job.name} finished`);
        } catch (e) {
          console.log(e);
          this.logger.error(`Job handler for ${job.name} not found`);
          return;
        }
      },
      {
        connection: this.connection as ConnectionOptions,
        ...this.options,
      }
    );

    worker.on('failed', async (job, error) => {
      this.logger.error(error.message, []);

      // If removeOnFail is set to true in the job options, job instance may be undefined.
      // This can occur if worker maxStalledCount has been reached and the removeOnFail is set to true.
      if (job && (job.attemptsMade === job.opts.attempts || job.finishedOn)) {
        // Call the failed method of the handler class if there is one
        // let jobHandler = this.app.container.make(job.name, [job]);
        // if (typeof jobHandler.failed === 'function') await jobHandler.failed();
      }
    });
  }

  public async clear(queueName: string) {
    if (!this.queues.has(queueName)) {
      return this.logger.info(`Queue [${queueName}] doesn't exist`);
    }

    const queue = this.queues.get(queueName || 'default');

    await queue!.obliterate().then(() => {
      return this.logger.info(`Queue [${queueName}] cleared`);
    });
  }

  public async list() {
    return this.queues;
  }

  public async get(queueName: string) {
    if (!this.queues.has(queueName)) {
      return this.logger.info(`Queue [${queueName}] doesn't exist`);
    }

    return this.queues.get(queueName);
  }
}
