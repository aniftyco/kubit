import { defineConfig } from 'kubit';

import { CacheConfig } from '@ioc:Kubit/Cache';

export default defineConfig<CacheConfig>({
  /*
  |--------------------------------------------------------------------------
  | Store
  |--------------------------------------------------------------------------
  |
  | This option controls the store that gets used. Kubit supports a variety
  | of stores out of the box: 'in-memory' and 'redis'.
  |
  */
  store: 'redis',

  /*
  |--------------------------------------------------------------------------
  | Time To Live (TTL)
  |--------------------------------------------------------------------------
  |
  | This option controls the default time to live for an item in the cache
  | in milliseconds. You can always set a TTL when you store a value.
  |
  */
  ttl: 6000,

  /*
  |--------------------------------------------------------------------------
  | Stores
  |--------------------------------------------------------------------------
  |
  | Here you may define the cache "stores" for your application as well as
  | their drivers.
  |
  */
  stores: {
    /*
    |--------------------------------------------------------------------------
    | Redis store
    |--------------------------------------------------------------------------
    |
    | Use this store to store cache in redis. By default it will use the redis
    | module to create a connection. You can choose any connection defined
    | inside `config/redis.ts` file.
    |
    */
    redis: { connection: 'local' },
  },
});
