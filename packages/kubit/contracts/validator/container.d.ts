declare module '@ioc:Kubit/Application' {
  import validator from '@ioc:Kubit/Validator';

  export interface ContainerBindings {
    'Kubit/Validator': typeof validator;
  }
}
