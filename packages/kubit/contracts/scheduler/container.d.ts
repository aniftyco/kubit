declare module '@ioc:Kubit/Application' {
  import { SchedulerContract } from '@ioc:Kubit/Scheduler';

  export interface ContainerBindings {
    'Kubit/Scheduler': SchedulerContract;
  }
}
