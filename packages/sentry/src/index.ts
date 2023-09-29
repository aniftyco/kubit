import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import * as Sentry from '@sentry/node';

interface SentryConfig extends Omit<Sentry.NodeOptions, 'enabled'> {}

export const sentryConfig = (config: SentryConfig): SentryConfig => config;

export default class SentryProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Sentry', () => ({ ...Sentry }));
  }

  public async boot() {
    const config = this.app.container.use('Adonis/Core/Config').get('sentry');

    Sentry.init({ ...config, enabled: this.app.inProduction });
  }
}
