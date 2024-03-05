import type { InferListFromConfig } from 'kubit';

declare module '@ioc:Kubit/Hash' {
  interface HashersList extends InferListFromConfig<typeof import('../config/hash').default> {}
}
