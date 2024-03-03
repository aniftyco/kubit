import { join } from 'path';

import { string } from '@poppinss/utils/build/helpers';

import { args } from '../../Decorators/args';
import { flags } from '../../Decorators/flags';
import { GeneratorCommand } from '../../GeneratorCommand';

/**
 * Command to make a new command
 */
export class MakeCommand extends GeneratorCommand {
  /**
   * Required by BaseGenerator
   */
  protected pattern = 'pascalcase' as const;
  protected resourceName: string;
  protected createExact: boolean;

  /**
   * Command meta data
   */
  public static commandName = 'make:command';
  public static description = 'Make a new ace command';

  @args.string({ description: 'Name of the command class' })
  public name: string;

  @flags.boolean({
    description: 'Create the command with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean;

  /**
   * Returns the template stub based upon the `--resource`
   * flag value
   */
  protected getStub(): string {
    return join(__dirname, '../../../..', 'templates', 'command.txt');
  }

  /**
   * Path to the commands directory
   */
  protected getDestinationPath(): string {
    return this.application.rcFile.directories.commands || 'app/Commands';
  }

  /**
   * Passed down to the template.
   */
  protected templateData() {
    return {
      toCommandName: () => {
        return function (filename: string, render: any) {
          return string.snakeCase(render(filename)).replace(/_/, ':');
        };
      },
    };
  }

  public async run(): Promise<void> {
    this.resourceName = this.name;
    this.createExact = this.exact;
    await super.generate();
  }
}
