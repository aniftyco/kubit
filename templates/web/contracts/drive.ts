import type { InferDisksFromConfig } from 'kubit';
import type driveConfig from '../config/drive';

declare module '@ioc:Kubit/Drive' {
  interface DisksList extends InferDisksFromConfig<typeof driveConfig> {}
}
