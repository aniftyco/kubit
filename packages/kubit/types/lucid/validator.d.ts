declare module '@ioc:Kubit/Validator' {
  import { Rule } from '@ioc:Kubit/Validator';

  export type DbRowCheckOptions = {
    table: string;
    column: string;
    dateFormat?: string;
    connection?: string;
    caseInsensitive?: boolean;
    constraints?: { [key: string]: any };
    where?: { [key: string]: any };
    whereNot?: { [key: string]: any };
  };

  export interface Rules {
    exists(options: DbRowCheckOptions): Rule;
    unique(options: DbRowCheckOptions): Rule;
  }
}
