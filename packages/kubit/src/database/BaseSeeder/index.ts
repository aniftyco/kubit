import { QueryClientContract } from '@ioc:Kubit/Database';

export class BaseSeeder {
  /**
   * @deprecated
   */
  public static developmentOnly: boolean;
  public static environment: string[];
  constructor(public client: QueryClientContract) {}

  public async run() {}
}
