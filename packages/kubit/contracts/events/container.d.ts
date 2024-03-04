declare module '@ioc:Kubit/Application' {
  import { EmitterContract } from '@ioc:Kubit/Event';

  export interface ContainerBindings {
    'Kubit/Event': EmitterContract;
  }
}
