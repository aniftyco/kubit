import { BaseCommand } from '../../BaseCommand';
import { flags } from '../../Decorators/flags';

/**
 * This command resets the database by rolling back to batch 0. Same
 * as calling "migration:rollback --batch=0"
 */
export class Reset extends BaseCommand {
  public static commandName = 'migration:reset';
  public static description = 'Rollback all migrations';
  public static settings = {
    loadApp: true,
  };

  /**
   * Custom connection for running migrations.
   */
  @flags.string({ description: 'Define a custom database connection', alias: 'c' })
  public connection: string;

  /**
   * Force command execution in production
   */
  @flags.boolean({ description: 'Explicitly force command to run in production' })
  public force: boolean;

  /**
   * Perform dry run
   */
  @flags.boolean({ description: 'Do not run actual queries. Instead view the SQL output' })
  public dryRun: boolean;

  /**
   * Disable advisory locks
   */
  @flags.boolean({ description: 'Disable locks acquired to run migrations safely' })
  public disableLocks: boolean;

  /**
   * Converting command properties to arguments
   */
  private getArgs() {
    const args: string[] = ['--batch=0'];
    if (this.force) {
      args.push('--force');
    }

    if (this.connection) {
      args.push(`--connection="${this.connection}"`);
    }

    if (this.dryRun) {
      args.push('--dry-run');
    }

    if (this.disableLocks) {
      args.push('--disable-locks');
    }

    return args;
  }

  /**
   * Handle command
   */
  public async run(): Promise<void> {
    const rollback = await this.kernel.exec('migration:rollback', this.getArgs());
    this.exitCode = rollback.exitCode;
    this.error = rollback.error;
  }
}
