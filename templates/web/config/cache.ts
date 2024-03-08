import { defineConfig } from 'kubit';

import { CacheConfig } from '@ioc:Kubit/Cache';

export default defineConfig<CacheConfig>({
  driver: 'in-memory',
});
