declare module '@ioc:Kubit/Application' {
  import { ViewContract } from '@ioc:Kubit/View';

  interface ContainerBindings {
    'Kubit/View': ViewContract;
  }
}
