import { join } from 'path';

import { args } from '../../Decorators/args';
import { flags } from '../../Decorators/flags';
import { GeneratorCommand } from '../../GeneratorCommand';

/**
 * Command to make a new event listener class
 */
export class MakeListener extends GeneratorCommand {
  /**
   * Required by BaseGenerator
   */
  protected form = 'singular' as const;
  protected pattern = 'pascalcase' as const;
  protected resourceName: string;
  protected createExact: boolean;

  /**
   * Command meta data
   */
  public static commandName = 'make:listener';
  public static description = 'Make a new event listener class';

  @args.string({ description: 'Name of the event listener class' })
  public name: string;

  @flags.boolean({
    description: 'Create the listener with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean;

  /**
   * Returns the template stub
   */
  protected getStub(): string {
    return join(__dirname, '../../../..', 'templates', 'event-listener.txt');
  }

  /**
   * Pull path from the `listeners` directory declaration from
   * the `package.json` file or fallback to `app/Listeners`
   */
  protected getDestinationPath(): string {
    return this.getPathForNamespace('listeners') || 'app/Listeners';
  }

  public async run() {
    this.resourceName = this.name;
    this.createExact = this.exact;
    await super.generate();
  }
}
