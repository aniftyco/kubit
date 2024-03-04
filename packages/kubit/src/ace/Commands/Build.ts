import { TSCONFIG_FILE_NAME } from '../../assembler/config/paths';
import { BaseCommand } from '../BaseCommand';
import { flags } from '../Decorators/flags';

/**
 * Compile typescript project Javascript
 */
export class Build extends BaseCommand {
  public static commandName = 'build';
  public static description =
    'Compile project from Typescript to JavaScript. Also compiles the frontend assets if using Webpack Encore';

  /**
   * Build for production
   */
  @flags.boolean({ description: 'Build for production', alias: 'prod' })
  public production: boolean;

  /**
   * Bundle frontend assets. Defaults to true
   */
  @flags.boolean({
    description: 'Build frontend assets when Webpack Encore is installed. Use --no-assets to disable',
  })
  public assets: boolean = true;

  /**
   * Ignore ts errors and complete the build process. Defaults to false
   */
  @flags.boolean({
    description: 'Ignore TypeScript errors and complete the build process',
  })
  public ignoreTsErrors: boolean;

  /**
   * Path to the TypeScript project configuration file. Defaults to "tsconfig.json"
   */
  @flags.string({
    description: 'Path to the TypeScript project configuration file',
  })
  public tsconfig: string = TSCONFIG_FILE_NAME;

  /**
   * Arguments to pass to the `encore` binary
   */
  @flags.array({ description: 'CLI options to pass to the Encore command line' })
  public encoreArgs: string[] = [];

  /**
   * Invoked automatically by ace
   */
  public async run() {
    const { Compiler } = await import('../../assembler/Compiler');

    /**
     * Stop on error when "ignoreTsErrors" is not set
     */
    const stopOnError = !this.ignoreTsErrors;

    try {
      const compiler = new Compiler(this.application.appRoot, this.encoreArgs, this.assets, this.logger, this.tsconfig);

      const compiled = this.production
        ? await compiler.compileForProduction(stopOnError, 'npm')
        : await compiler.compile(stopOnError);

      /**
       * Set exitCode based upon the compiled status
       */
      if (!compiled) {
        this.exitCode = 1;
      }
    } catch (error) {
      this.logger.fatal(error);
      this.exitCode = 1;
    }
  }
}
