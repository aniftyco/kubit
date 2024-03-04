declare module '@ioc:Kubit/Application' {
  import { DriveManagerContract } from '@ioc:Kubit/Drive';

  export interface ContainerBindings {
    'Kubit/Drive': DriveManagerContract;
  }
}
