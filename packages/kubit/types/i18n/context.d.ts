declare module '@ioc:Kubit/HttpContext' {
  import { I18nContract } from '@ioc:Kubit/I18n';

  interface HttpContextContract {
    i18n: I18nContract;
  }
}
