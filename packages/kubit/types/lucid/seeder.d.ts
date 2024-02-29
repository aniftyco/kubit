declare module '@ioc:Kubit/Lucid/Seeder' {
  import { FileNode, QueryClientContract } from '@ioc:Kubit/Lucid/Database';

  /**
   * Shape of seeder class
   */
  export type SeederConstructorContract = {
    /**
     * @deprecated
     */
    developmentOnly: boolean;
    environment: string[];
    new (client: QueryClientContract): {
      client: QueryClientContract;
      run(): Promise<void>;
    };
  };

  /**
   * Shape of file node returned by the run method
   */
  export type SeederFileNode = {
    status: 'pending' | 'completed' | 'failed' | 'ignored';
    error?: any;
    file: FileNode<unknown>;
  };

  const BaseSeeder: SeederConstructorContract;
  export default BaseSeeder;
}
