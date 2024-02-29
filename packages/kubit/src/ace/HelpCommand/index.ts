import { BaseCommand } from '../BaseCommand';
import { CommandContract } from '../Contracts';

/**
 * The help command for print the help output
 */
export class HelpCommand extends BaseCommand implements CommandContract {
  public static commandName = 'help';
  public static description = 'See help for all the commands';

  public async run() {
    this.kernel.printHelp();
  }
}
