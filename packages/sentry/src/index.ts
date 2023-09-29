import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

interface SentryConfig extends Omit<Sentry.NodeOptions, 'enabled'> {}

export const sentryConfig = (config: SentryConfig): SentryConfig => config;

export default class SentryProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Sentry', () => {
      return { ...Sentry };
    });
  }

  public async boot() {
    const config = this.app.container.use('Adonis/Core/Config');

    Sentry.init({
      ...config.get('sentry'),
      enabled: this.app.inProduction,
      integrations: [new ProfilingIntegration()],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    });
  }
}
