import { defineConfig } from 'kubit';

import Env from '@ioc:Kubit/Env';

import type { QueueConfig } from '@ioc:Kubit/Queue';

/*
|--------------------------------------------------------------------------
| Queue configuration
|--------------------------------------------------------------------------
|
*/
export default defineConfig<QueueConfig>({
  connection: Env.get('REDIS_CONNECTION', 'local'),
  /*
  |--------------------------------------------------------------------------
  | Default Job Attempts
  |--------------------------------------------------------------------------
  |
  | The default number of attempts after which the job will be marked as
  | failed. You can also set the number of attempts on individual jobs
  | as well.
  |
  | @see https://docs.bullmq.io/guide/retrying-failing-jobs
  |
  */
  attempts: 3,

  /*
  |--------------------------------------------------------------------------
  | Auto-Removal of Jobs
  |--------------------------------------------------------------------------
  |
  | Numbers of jobs to keep in the completed and failed queues before they
  | are removed. This is important to keep the size of these queues in
  | control. Set the value to false to disable auto-removal.
  |
  | @see https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
  |
  */
  removeOnComplete: 100,
  removeOnFail: 100,
});
