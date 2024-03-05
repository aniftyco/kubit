import type { InferDisksFromConfig } from 'kubit';

declare module '@ioc:Kubit/Drive' {
  interface DisksList extends InferDisksFromConfig<typeof import('../config/drive').default> {}
}
