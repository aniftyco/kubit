import { ApplicationContract } from '@ioc:Adonis/Core/Application';

interface QueueConfig {}

export const queueConfig = (config: QueueConfig): QueueConfig => config;

export default class QueueProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Queue', () => {
      return null;
    });
  }

  public async boot() {
    const config = this.app.container.use('Adonis/Core/Config').get('queue');
  }
}
