declare module '@ioc:Kubit/Sentry' {
  import type { NodeOptions } from '@sentry/node';
  export interface SentryConfig extends Omit<NodeOptions, 'enabled'> {}
  import * as Sentry from '@sentry/node';

  export const defineConfig: (config: SentryConfig) => SentryConfig;

  export default Sentry;
}
