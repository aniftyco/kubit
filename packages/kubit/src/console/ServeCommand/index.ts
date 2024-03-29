import { BaseCommand } from '../BaseCommand';
import { CommandContract } from '../Contracts';
import { flags } from '../Decorators/flags';

export class ServeCommand extends BaseCommand implements CommandContract {
  public static commandName = 'serve';
  public static description =
    'Start the Kubit HTTP server, along with the file watcher. Also starts the webpack dev server when webpack encore is installed';

  public static settings = {
    stayAlive: true,
  };

  /**
   * Bundle frontend assets. Defaults to true
   */
  @flags.boolean({
    description: 'Start webpack dev server when encore is installed. Use "--no-assets" to disable',
  })
  public assets: boolean = true;

  /**
   * Allows watching for file changes
   */
  @flags.boolean({
    description: 'Watch for file changes and re-start the HTTP server on change',
    alias: 'w',
  })
  public watch: boolean;

  /**
   * Detect changes by polling files
   */
  @flags.boolean({
    description: 'Detect file changes by polling files instead of listening to filesystem events',
    alias: 'p',
  })
  public poll: boolean;

  /**
   * Arguments to pass to the `node` binary
   */
  @flags.array({ description: 'CLI options to pass to the node command line' })
  public nodeArgs: string[] = [];

  /**
   * Arguments to pass to the `encore` binary
   */
  @flags.array({ description: 'CLI options to pass to the encore command line' })
  public encoreArgs: string[] = [];

  public async run() {
    const { DevServer } = await import('../../assembler/DevServer');

    try {
      if (this.watch) {
        await new DevServer(this.application.appRoot, this.nodeArgs, this.encoreArgs, this.assets, this.logger).watch(
          this.poll
        );
      } else {
        await new DevServer(this.application.appRoot, this.nodeArgs, this.encoreArgs, this.assets, this.logger).start();
      }
    } catch (error) {
      this.logger.fatal(error);
    }
  }
}
