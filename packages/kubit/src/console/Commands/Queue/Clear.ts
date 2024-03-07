import { BaseCommand } from '../../BaseCommand';
import { flags } from '../../Decorators/flags';

export class QueueClear extends BaseCommand {
  public static commandName = 'queue:clear';
  public static description = 'Clear a queue of jobs';

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  @flags.array({ alias: 'q', description: 'The queue(s) to clear' })
  public queue: string[] = [];

  public async run() {
    const { Queue } = this.application.container.resolveBinding('Kubit/Queue');

    if (this.queue.length === 0) {
      this.queue = this.application.container.resolveBinding('Kubit/Config').get('queue.queues', ['default']);
    }

    await Promise.all(
      this.queue.map(async (queue) => {
        await Queue.clear(queue);
      })
    );
  }
}
