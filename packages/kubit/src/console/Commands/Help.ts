import { BaseCommand } from '../BaseCommand';

/**
 * The help command for print the help output
 */
export class Help extends BaseCommand {
  public static commandName = 'help';
  public static description = 'See help for all the commands';

  public static settings = {
    loadApp: true,
  };

  public async run() {
    this.kernel.printHelp();
  }
}
