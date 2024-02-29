declare module '@ioc:Kubit/Application' {
  import { ReplContract } from '@ioc:Kubit/Repl';

  export interface ContainerBindings {
    'Kubit/Repl': ReplContract;
  }
}
