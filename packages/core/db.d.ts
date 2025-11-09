declare module "kubit:db" {
  export class Migration {}

  export const schema: {
    createTable(
      table: string,
      callback: (table: Record<string, any>) => void
    ): Promise<void>;
    dropTableIfExists(table: string): Promise<void>;
  };
}

