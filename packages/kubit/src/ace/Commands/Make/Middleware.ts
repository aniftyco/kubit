import { join } from 'path';

import { args } from '../../Decorators/args';
import { flags } from '../../Decorators/flags';
import { GeneratorCommand } from '../../GeneratorCommand';

/**
 * Command to make a new middleware
 */
export class MakeMiddleware extends GeneratorCommand {
  /**
   * Required by BaseGenerator
   */
  protected suffix = '';
  protected form = 'singular' as const;
  protected pattern = 'pascalcase' as const;
  protected resourceName: string;
  protected createExact: boolean;

  /**
   * Command meta data
   */
  public static commandName = 'make:middleware';
  public static description = 'Make a new middleware';

  @args.string({ description: 'Name of the middleware class' })
  public name: string;

  @flags.boolean({
    description: 'Create the middleware with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean;

  /**
   * Returns the template stub path
   */
  protected getStub(): string {
    return join(__dirname, '../../../..', 'templates', 'middleware.txt');
  }

  /**
   * Middleware are always created inside `app/Middleware` directory.
   * We can look into configuring it later.
   */
  protected getDestinationPath(): string {
    return this.getPathForNamespace('middleware') || 'app/Middleware';
  }

  public async run() {
    this.resourceName = this.name;
    this.createExact = this.exact;
    const middlewareNamespace = this.application.rcFile.namespaces.middleware || '@pp/Middleware';

    const file = await super.generate();
    if (!file) {
      return;
    }

    const fileJSON = file.toJSON();

    if (fileJSON.state === 'persisted') {
      this.ui
        .instructions()
        .heading('Register middleware')
        .add(`Open ${this.colors.cyan('bootstrap/kernel.ts')} file`)
        .add(`Register the following function as a global or a named middleware`)
        .add(this.colors.cyan().underline(`() => import('${middlewareNamespace}/${fileJSON.filename}')`))
        .render();
    }
  }
}
