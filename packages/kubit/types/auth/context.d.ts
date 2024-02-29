declare module '@ioc:Kubit/HttpContext' {
  import { AuthContract } from '@ioc:Kubit/Auth';

  interface HttpContextContract {
    auth: AuthContract;
  }
}
