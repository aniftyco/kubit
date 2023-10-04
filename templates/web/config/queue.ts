import Env from '@ioc:Adonis/Core/Env';
import { queueConfig } from '@kubit/queue';

/*
|--------------------------------------------------------------------------
| Queue configuration
|--------------------------------------------------------------------------
|
*/
export default queueConfig({
  connection: Env.get('REDIS_URL'),
  queue: {},
});
