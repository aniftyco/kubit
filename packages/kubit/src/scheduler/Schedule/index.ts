import { DateTime } from 'luxon';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { Condition, ScheduleContract, ScheduleHandler, Time } from '@ioc:Kubit/Scheduler';

import ManagesFrequencies from '../ManagesFrequencies';

export default class Schedule extends ManagesFrequencies implements ScheduleContract {
  constructor(
    private env: ApplicationContract['nodeEnvironment'],
    public command: ScheduleHandler
  ) {
    super();
  }

  protected inTimeInterval(startTime: Time, endTime: Time) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let [now, start, end] = [
      DateTime.now().setZone(this.currentTimezone),
      DateTime.now()
        .set({ minute: startMinutes, hour: startHours, second: 0, millisecond: 0 })
        .setZone(this.currentTimezone),
      DateTime.now()
        .set({ minute: endMinutes, hour: endHours, second: 0, millisecond: 0 })
        .setZone(this.currentTimezone),
    ];

    if (end < start) {
      if (start > now) {
        start = start.minus({ days: 1 });
      } else {
        end = end.plus({ days: 1 });
      }
    }

    return () => now > start && now < end;
  }

  public between(start: Time, end: Time) {
    return this.when(this.inTimeInterval(start, end));
  }

  public unlessBetween(start: Time, end: Time) {
    return this.skip(this.inTimeInterval(start, end));
  }

  public filters: Condition[] = [];

  public rejects: Condition[] = [];

  public skip(condition: Condition) {
    this.rejects.push(condition);

    return this;
  }

  public when(condition: Condition) {
    this.filters.push(condition);

    return this;
  }

  public environments(environments: Array<ApplicationContract['nodeEnvironment']>) {
    this.when(() => environments.includes(this.env));

    return this;
  }
}
