import Env from '@ioc:Adonis/Core/Env';
import { sentryConfig } from '@kubit/sentry';

/*
|--------------------------------------------------------------------------
| Sentry configuration
|--------------------------------------------------------------------------
|
*/
export default sentryConfig({
  dsn: Env.get('SENTRY_DSN'),
  environment: Env.get('NODE_ENV'),
});
