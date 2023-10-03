import Env from '@ioc:Adonis/Core/Env';
import { sentryConfig } from '@kubit/sentry';
import { ProfilingIntegration } from '@sentry/profiling-node';

/*
|--------------------------------------------------------------------------
| Sentry configuration
|--------------------------------------------------------------------------
|
*/
export default sentryConfig({
  dsn: Env.get('SENTRY_DSN'),
  environment: Env.get('NODE_ENV'),
  // Performance Monitoring
  integrations: [new ProfilingIntegration()],
  enableTracing: true,
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});
