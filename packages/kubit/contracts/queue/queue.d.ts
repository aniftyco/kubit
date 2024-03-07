declare module '@ioc:Kubit/Queue' {
  import type {
    ConnectionOptions,
    WorkerOptions,
    QueueOptions,
    JobsOptions,
    Job as BullJob,
    Queue as BullQueue,
  } from 'bullmq';
  import type { RedisConnectionsList } from '@ioc:Kubit/Redis';

  export type DataForJob<K extends string> = K extends keyof JobsList ? JobsList[K] : Record<string, unknown>;

  export type DispatchOptions = JobsOptions & {
    queueName?: 'default' | string;
  };

  export type QueueConfig = {
    connection: keyof RedisConnectionsList;
  } & JobsOptions;

  export interface QueueContract {
    dispatch<K extends keyof JobsList>(job: K, payload: DataForJob<K>, options?: DispatchOptions): Promise<BullJob>;
    dispatch<K extends string>(job: K, payload: DataForJob<K>, options?: DispatchOptions): Promise<BullJob>;
    process(options?: { queueName?: string }): Promise<void>;
    clear<K extends string>(queue: K): Promise<void>;
    list(): Promise<Map<string, BullQueue>>;
    get(queueName?: string): Promise<void | BullQueue>;
  }

  export interface JobHandlerContract {
    handle(): Promise<void>;
  }

  const Queue: QueueContract;

  export default Queue;
}
