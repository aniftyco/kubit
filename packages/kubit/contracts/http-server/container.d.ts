declare module '@ioc:Kubit/Application' {
  import { CookieClientContract } from '@ioc:Kubit/CookieClient';
  import { HttpContextConstructorContract } from '@ioc:Kubit/HttpContext';
  import { RequestConstructorContract } from '@ioc:Kubit/Request';
  import { ResponseConstructorContract } from '@ioc:Kubit/Response';
  import { RouterContract } from '@ioc:Kubit/Route';
  import { ServerContract } from '@ioc:Kubit/Server';

  export interface ContainerBindings {
    'Kubit/Route': RouterContract;
    'Kubit/Server': ServerContract;
    'Kubit/CookieClient': CookieClientContract;
    'Kubit/Request': RequestConstructorContract;
    'Kubit/Response': ResponseConstructorContract;
    'Kubit/HttpContext': HttpContextConstructorContract;
  }
}
