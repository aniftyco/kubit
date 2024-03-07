import cron from 'node-cron';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { ScheduleContract, SchedulerContract } from '@ioc:Kubit/Scheduler';

import { Kernel } from '../../console';
import Schedule from '../Schedule';

export default class Scheduler implements SchedulerContract {
  private events: Schedule[] = [];

  constructor(private app: ApplicationContract) {}

  public call(callback: (kernel: any) => void): ScheduleContract {
    const schedule = new Schedule(this.app.nodeEnvironment, callback);

    this.events.push(schedule);

    return schedule;
  }

  public command(command: string | string[]) {
    const [cmd, args] = Array.isArray(command) ? command : command.split(' ');
    const callback = async (kernel: Kernel) => {
      try {
        const result = await kernel.exec(cmd, args as any);
        return result;
      } catch (error) {
        return error;
      }
    };

    return this.call(callback);
  }

  public run(kernel: Kernel) {
    this.app.logger.info('Schedule processing started');
    for (const event of this.events)
      cron.schedule(event.expression, async () => {
        for (const filter of event.filters) {
          if (!(await filter())) return;
        }

        for (const reject of event.rejects) {
          if (await reject()) return;
        }

        return event.command(kernel);
      });
  }
}
