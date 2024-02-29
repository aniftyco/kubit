declare module '@ioc:Kubit/Application' {
  import { I18nManagerContract } from '@ioc:Kubit/I18n';

  interface ContainerBindings {
    'Kubit/I18n': I18nManagerContract;
  }
}
