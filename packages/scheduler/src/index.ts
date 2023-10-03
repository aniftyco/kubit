import { ApplicationContract } from '@ioc:Adonis/Core/Application';

interface SchedulerConfig {}

export const schedulerConfig = (config: SchedulerConfig): SchedulerConfig => config;

export default class SchedulerProvider {
  public static needsApplication = true;

  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Kubit/Scheduler', () => {
      return null;
    });
  }

  public async boot() {
    const config = this.app.container.use('Adonis/Core/Config').get('scheduler');
  }
}
