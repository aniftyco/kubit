import { BaseCommand } from '../BaseCommand';

export class Repl extends BaseCommand {
  public static commandName = 'repl';
  public static description = 'Start a new REPL session';

  public static settings = {
    loadApp: true,
    environment: 'repl' as const,
    stayAlive: true,
  };

  public async run() {
    this.application.container.withBindings(['Kubit/Route'], (Route) => {
      Route.commit();
    });
    this.application.container.use('Kubit/Repl').start();

    /**
     * Gracefully shutdown the application
     */
    this.application.container.use('Kubit/Repl').server.on('exit', async () => {
      await this.application.shutdown();
    });
  }
}
