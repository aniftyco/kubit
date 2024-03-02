import { BaseCommand } from 'kubit';

/**
 * The help command for print the help output
 */
export class TestCommand extends BaseCommand {
  public static commandName = 'test';
  public static description = 'testing';

  public async run() {
    console.log('hi');
  }
}
