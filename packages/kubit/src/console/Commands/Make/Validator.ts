import { join } from 'path';

import { args } from '../../Decorators/args';
import { flags } from '../../Decorators/flags';
import { GeneratorCommand } from '../../GeneratorCommand';

/**
 * Command to make a new validator
 */
export class MakeValidator extends GeneratorCommand {
  /**
   * Required by BaseGenerator
   */
  protected suffix = 'Validator';
  protected form = 'singular' as const;
  protected pattern = 'pascalcase' as const;
  protected resourceName: string;
  protected createExact: boolean;

  /**
   * Command meta data
   */
  public static commandName = 'make:validator';
  public static description = 'Make a new validator';

  @args.string({ description: 'Name of the validator class' })
  public name: string;

  @flags.boolean({
    description: 'Create the validator with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean;

  /**
   * Returns the template stub path
   */
  protected getStub(): string {
    return join(__dirname, '../../../..', 'templates', 'validator.txt');
  }

  /**
   * Pull path for the `validators` directory declaration from
   * the `.adonisrc.json` file or fallback to `app/Validators`
   */
  protected getDestinationPath(): string {
    return this.getPathForNamespace('validators') || 'app/Validators';
  }

  public async run() {
    this.resourceName = this.name;
    this.createExact = this.exact;
    await super.generate();
  }
}
