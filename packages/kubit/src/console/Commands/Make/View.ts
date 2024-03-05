import { join } from 'path';

import { args } from '../../Decorators/args';
import { flags } from '../../Decorators/flags';
import { GeneratorCommand } from '../../GeneratorCommand';

/**
 * Command to make a new view
 */
export class MakeView extends GeneratorCommand {
  /**
   * Required by BaseGenerator
   */
  protected suffix = '';
  protected extname = '.edge';
  protected pattern = 'snakecase' as const;
  protected resourceName: string;
  protected createExact: boolean;

  /**
   * Command meta data
   */
  public static commandName = 'make:view';
  public static description = 'Make a new view template';

  @args.string({ description: 'Name of the view' })
  public name: string;

  @flags.boolean({
    description: 'Create the template file with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean;

  /**
   * Returns the template stub path
   */
  protected getStub(): string {
    return join(__dirname, '../../../..', 'templates', 'view.txt');
  }

  /**
   * Path to the providers directory
   */
  protected getDestinationPath(): string {
    return this.application.bootConfig.directories.views || 'resources/views';
  }

  public async run() {
    this.resourceName = this.name;
    this.createExact = this.exact;
    await super.generate();
  }
}
