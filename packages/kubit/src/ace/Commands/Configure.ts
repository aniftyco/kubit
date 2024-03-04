import { join } from 'path';

import { files, logger, tasks, utils } from '../../sink';
import { BaseCommand } from '../BaseCommand';
import { args } from '../Decorators/args';

/**
 * Configure a package
 */
export class Configure extends BaseCommand {
  public static commandName = 'configure';
  public static description = 'Configure one or more Kubit packages';
  public static aliases = ['invoke'];

  /**
   * Use yarn when building for production to install dependencies
   */
  @args.spread({
    description: 'Name of the package(s) you want to configure',
  })
  public packages: string[];

  /**
   * Returns package manager for installing dependencies
   */
  private getPackageManager() {
    if (process.env['ADONIS_CREATE_APP_CLIENT']) {
      return process.env['ADONIS_CREATE_APP_CLIENT'] as 'yarn' | 'npm' | 'pnpm';
    }
    return utils.getPackageManager(this.application.appRoot);
  }

  /**
   * Configure encore
   */
  private async configureEncore() {
    /**
     * Create the webpack config file
     */
    const webpackConfigFile = new files.MustacheFile(
      this.application.appRoot,
      'webpack.config.ts',
      join(__dirname, '..', 'templates/webpack.config.txt')
    );
    if (!webpackConfigFile.exists()) {
      webpackConfigFile.apply({}).commit();
      logger.action('create').succeeded('webpack.config.ts');
    }

    /**
     * Create app.js entrypoint
     */
    const entryPointFile = new files.NewLineFile(this.application.appRoot, 'resources/js/app.ts');
    if (!entryPointFile.exists()) {
      entryPointFile.add('// app entrypoint').commit();
      logger.action('create').succeeded('resources/js/app.ts');
    }

    /**
     * Install Encore
     */
    const pkgFile = new files.PackageJsonFile(this.application.appRoot);
    pkgFile.install('@symfony/webpack-encore@4.1.1');
    pkgFile.install('webpack@^5.72');
    pkgFile.install('webpack-cli@^4.9.1');
    pkgFile.install('@babel/core@^7.17.0');
    pkgFile.install('@babel/preset-env@^7.16.0');
    pkgFile.useClient(this.getPackageManager());

    const spinner = logger.await(logger.colors.gray('configure @symfony/webpack-encore'));

    try {
      const response = await pkgFile.commitAsync();
      if (response && response.status === 1) {
        spinner.stop();
        logger.fatal({ message: 'Unable to configure encore', stack: response.stderr.toString() });
      } else {
        spinner.stop();
        logger.success('Configured Encore successfully');
      }
    } catch (error) {
      spinner.stop();
      logger.fatal(error);
    }
  }

  /**
   * Configure a give package
   */
  private async configurePackage(name: string) {
    if (name === 'encore') {
      await this.configureEncore();
      return;
    }

    await new tasks.Instructions(name, this.application.appRoot, this.application, true).execute();
  }

  /**
   * Invoked automatically by ace
   */
  public async run() {
    for (let name of this.packages) {
      await this.configurePackage(name);
    }
  }
}
