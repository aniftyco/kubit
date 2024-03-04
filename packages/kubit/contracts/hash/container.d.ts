declare module '@ioc:Kubit/Application' {
  import { HashContract } from '@ioc:Kubit/Hash';

  export interface ContainerBindings {
    'Kubit/Hash': HashContract;
  }
}
