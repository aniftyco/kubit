import { join } from 'path';

import { BaseCommand } from '../../BaseCommand';
import { args } from '../../Decorators/args';
import { flags } from '../../Decorators/flags';

/**
 * Command to make a new Factory
 */
export class MakeFactory extends BaseCommand {
  public static commandName = 'make:factory';
  public static description = 'Make a new factory';

  /**
   * Name of the model to be used in the factory
   */
  @args.string({ description: 'The name of the model' })
  public model: string;

  /**
   * Import path to the model used in the factory
   */
  @flags.string({ description: 'The path to the model' })
  public modelPath: string;

  @flags.boolean({
    description: 'Create the factory with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean;

  /**
   * Generate model import path used in the factory
   */
  private generateModelImportPath() {
    let base = this.application.bootConfig.namespaces.models || '@app/Models';
    if (!base.endsWith('/')) {
      base += '/';
    }

    let importPath = this.model;
    if (this.modelPath) {
      importPath = this.modelPath;
    } else if (importPath.endsWith('Factory')) {
      importPath = importPath.replace(/Factory$/, '');
    }

    if (importPath.startsWith(base)) {
      return importPath;
    }

    return base + importPath;
  }

  /**
   * Path to the factories directory
   */
  protected getDestinationPath() {
    const base = this.application.bootConfig.directories.database || 'database';
    return join(base, 'factories');
  }

  /**
   * Passed down to the stub template
   */
  protected templateData() {
    return {
      model: this.model,
      modelImportPath: this.generateModelImportPath(),
      toModelName: () => {
        return function (model: string, render: any) {
          return render(model).split('/').pop();
        };
      },
    };
  }

  public async run() {
    const stub = join(__dirname, '../../../..', 'templates', 'factory.txt');

    this.generator
      .addFile(this.model, { pattern: 'pascalcase', form: 'singular', suffix: 'Factory' })
      .stub(stub)
      .useMustache()
      .destinationDir(this.getDestinationPath())
      .appRoot(this.application.appRoot)
      .apply(this.templateData());

    await this.generator.run();
  }
}
