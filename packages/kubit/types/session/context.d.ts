declare module '@ioc:Kubit/HttpContext' {
  import { SessionContract } from '@ioc:Kubit/Session';

  interface HttpContextContract {
    session: SessionContract;
  }
}
