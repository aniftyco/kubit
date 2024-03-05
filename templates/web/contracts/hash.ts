import type { InferListFromConfig } from 'kubit';
import type hashConfig from '../config/hash';

declare module '@ioc:Kubit/Hash' {
  interface HashersList extends InferListFromConfig<typeof hashConfig> {}
}
