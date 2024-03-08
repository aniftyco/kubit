import { defineConfig } from 'kubit';

import { CacheConfig } from '@ioc:Kubit/Cache';

export default defineConfig<CacheConfig>({
  store: 'in-memory',
});
