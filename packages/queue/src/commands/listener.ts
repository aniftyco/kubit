import { BaseCommand, flags } from '@adonisjs/core/build/standalone';

export default class QueueListener extends BaseCommand {
  public static commandName = 'queue:listen';
  public static description = 'Listen to one or multiple queues';

  @flags.array({ alias: 'q', description: 'The queue(s) to listen on' })
  public queue: string[] = [];

  public static settings = {
    loadApp: true,
    stayAlive: true,
  };

  public async run() {
    const Queue = this.application.container.resolveBinding('Kubit/Queue');

    await Queue.process();
  }
}
