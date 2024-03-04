declare module '@ioc:Kubit/Cors' {
  import { HttpContextContract } from '@ioc:Kubit/HttpContext';
  import { RequestContract } from '@ioc:Kubit/Request';

  type AllowedValuesTypes = boolean | string | string[];

  export type CorsConfig = {
    enabled: boolean | ((request: RequestContract, ctx: HttpContextContract) => boolean);
    origin: AllowedValuesTypes | ((origin: string, ctx: HttpContextContract) => AllowedValuesTypes);
    methods: string[];
    headers: AllowedValuesTypes | ((headers: string[], ctx: HttpContextContract) => AllowedValuesTypes);
    exposeHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
}
