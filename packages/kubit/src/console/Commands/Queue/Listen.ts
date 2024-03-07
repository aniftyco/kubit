import { BaseCommand } from '../../BaseCommand';
import { flags } from '../../Decorators/flags';

export class QueueListen extends BaseCommand {
  public static commandName = 'queue:listen';
  public static description = 'Listen to one or multiple queues';

  public static settings = {
    loadApp: true,
    stayAlive: true,
  };

  @flags.array({ alias: 'q', description: 'The queue(s) to listen on' })
  public queue: string[] = [];

  public async run() {
    const { Queue } = this.application.container.resolveBinding('Kubit/Queue');
    const Config = this.application.container.resolveBinding('Kubit/Config');
    const Router = this.application.container.use('Kubit/Route');

    Router.commit();

    if (this.queue.length === 0) {
      this.queue = Config.get('queue.queues', ['default']);
    }

    await Promise.all(
      this.queue.map(async (queueName) => {
        await Queue.process({ queueName });
      })
    );
  }
}
