import { BaseCommand } from '../BaseCommand';

export class Scheduler extends BaseCommand {
  public static commandName = 'scheduler';
  public static description = 'Run the scheduled tasks';

  public static settings = {
    loadApp: true,
    stayAlive: true,
  };

  public async run() {
    (this.application.container.use('Kubit/Scheduler') as any).run(this.kernel);
  }
}
