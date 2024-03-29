import { dirname, join } from 'path';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { esmRequire } from '@poppinss/utils';
import { resolveFrom } from '@poppinss/utils/build/helpers';

import { PackageFile, PackageInstructionsBlock } from '../../Contracts';
import * as sink from '../../index';
import { TemplatesManager } from '../TemplatesManager';

/**
 * Exposes the API to execute the instructions of a package, defined inside
 * the `package.json` file.
 */
export class Instructions {
  /**
   * Path to the package package.json file
   */
  private packagePath: string = this.getPackagePath();
  private markdownDisplay: 'browser' | 'terminal' | undefined = undefined;
  private logger: typeof sink.logger = sink.logger;

  constructor(
    private packageName: string,
    private projectRoot: string,
    private application: ApplicationContract,
    private verbose = false
  ) {}

  /**
   * Formats object to string
   */
  private formatObject(values: { [key: string]: string }): string {
    return Object.keys(values)
      .map((key) => {
        return `"${key} = ${values[key]}"`;
      })
      .join(',');
  }

  /**
   * Formats array to string
   */
  private formatArray(values: string[]): string {
    return values.map((v) => `"${v}"`).join(',');
  }

  /**
   * Returns the suffix for the logger statements
   */
  private getSuffix(value: string, key?: string) {
    if (!this.verbose) {
      return '';
    }

    if (key) {
      return this.logger.colors.yellow().dim(`{ ${key} += ${value} }`);
    }

    return this.logger.colors.yellow().dim(`{ ${value} }`);
  }

  /**
   * Returns the absolute path to the package
   */
  private getPackagePath() {
    try {
      return resolveFrom(this.projectRoot, `${this.packageName}/package.json`);
    } catch (error) {
      if (['MODULE_NOT_FOUND', 'ENOENT'].includes(error.code)) {
        throw new Error(`Cannot invoke instructions. Missing package "${this.packageName}"`);
      }
      throw error;
    }
  }

  /**
   * Load package json file from the package root directory
   */
  private loadPackageJsonFile(): PackageFile {
    return require(this.packagePath);
  }

  /**
   * Copies templates to the user project
   */
  private copyTemplates(instructions: PackageInstructionsBlock) {
    if (!instructions.templates) {
      return;
    }

    const templatesSourceDir = instructions.templates.basePath || './build/templates';
    const templatesManager = new TemplatesManager(
      this.projectRoot,
      join(dirname(this.packagePath), templatesSourceDir),
      this.application
    );
    templatesManager.useLogger(this.logger).copy(instructions.templates);
  }

  /**
   * Set environment variables
   */
  private setEnvVariables(instructions: PackageInstructionsBlock) {
    if (!instructions.env) {
      return;
    }

    const envFile = new sink.files.EnvFile(this.projectRoot);
    Object.keys(instructions.env).forEach((envKey) => envFile.set(envKey, instructions.env![envKey]));

    envFile.commit();
    const suffix = this.getSuffix(this.formatObject(instructions.env));
    this.logger.action('update').succeeded(`.env ${suffix}`);
  }

  /**
   * Adds the types to the tsconfig.json file
   */
  private setTypes(instructions: PackageInstructionsBlock) {
    if (!instructions.types) {
      return;
    }

    const fileName = 'tsconfig.json';
    const tsConfig = new sink.files.JsonFile(this.projectRoot, fileName);
    const existingTypes = tsConfig.get('compilerOptions.types') || [];

    /**
     * Push type when doesn't exists already
     */
    if (!existingTypes.find((type: string) => type.includes(instructions.types!))) {
      existingTypes.push(instructions.types);
      tsConfig.set('compilerOptions.types', existingTypes);
      tsConfig.commit();

      const suffix = this.getSuffix(this.formatArray([instructions.types]), 'types');
      this.logger.action('update').succeeded(`${fileName} ${suffix}`);
    }
  }

  /**
   * Adds the meta files to `package.json` file
   */
  private setMetaFiles(instructions: PackageInstructionsBlock) {
    if (!instructions.metaFiles) {
      return;
    }

    const rcFile = new sink.files.RCFile(this.projectRoot);
    instructions.metaFiles.forEach((metaFile) => {
      if (typeof metaFile === 'string') {
        rcFile.addMetaFile(metaFile);
      } else {
        rcFile.addMetaFile(metaFile.pattern, metaFile.reloadServer);
      }
    });
    rcFile.commit();

    const suffix = this.getSuffix(
      this.formatArray(
        instructions.metaFiles.map((metaFile) => {
          return typeof metaFile === 'string' ? metaFile : metaFile.pattern;
        })
      ),
      'metaFiles'
    );

    this.logger.action('update').succeeded(`package.json ${suffix}`);
  }

  /**
   * Adds the preloads to `package.json` file
   */
  private setPreloads(instructions: PackageInstructionsBlock) {
    if (!instructions.preloads) {
      return;
    }

    const rcFile = new sink.files.RCFile(this.projectRoot);
    instructions.preloads.forEach((preloadFile) => {
      if (typeof preloadFile === 'string') {
        rcFile.setPreload(preloadFile);
      } else {
        rcFile.setPreload(preloadFile.file, preloadFile.environment, preloadFile.optional);
      }
    });
    rcFile.commit();

    const suffix = this.getSuffix(
      this.formatArray(
        instructions.preloads.map((preloadFile) => {
          return typeof preloadFile === 'string' ? preloadFile : preloadFile.file;
        })
      ),
      'preloads'
    );

    this.logger.action('update').succeeded(`package.json ${suffix}`);
  }

  /**
   * Set commands inside the package.json file
   */
  private setCommands(instructions: PackageInstructionsBlock) {
    if (!instructions.commands) {
      return;
    }

    const rcFile = new sink.files.RCFile(this.projectRoot);
    instructions.commands.forEach((command) => rcFile.addCommand(command));
    rcFile.commit();

    const suffix = this.getSuffix(this.formatArray(instructions.commands), 'commands');
    this.logger.action('update').succeeded(`package.json ${suffix}`);
  }

  /**
   * Set aliases inside the package.json file
   */
  private setAliases(instructions: PackageInstructionsBlock) {
    if (!instructions.aliases) {
      return;
    }

    const rcFile = new sink.files.RCFile(this.projectRoot);
    const tsConfig = new sink.files.JsonFile(this.projectRoot, 'tsconfig.json');

    const existingPaths = tsConfig.get('compilerOptions.paths') || {};

    Object.keys(instructions.aliases).forEach((alias) => {
      rcFile.setAlias(alias, instructions.aliases![alias]);
      existingPaths[`${alias}/*`] = [`${instructions.aliases![alias]}/*`];
    });

    const suffix = this.getSuffix(this.formatObject(instructions.aliases), 'aliases');

    rcFile.commit();
    this.logger.action('update').succeeded(`package.json ${suffix}`);

    tsConfig.set('compilerOptions.paths', existingPaths);
    tsConfig.commit();
    this.logger.action('update').succeeded(`tsconfig.json ${suffix}`);
  }

  /**
   * Sets providers or ace providers inside the `package.json` file
   */
  private setProviders(instructions: PackageInstructionsBlock) {
    /**
     * Return early when not providers are mentioned
     */
    if (!instructions.providers && !instructions.consoleProviders && !instructions.testProviders) {
      return;
    }

    const rcFile = new sink.files.RCFile(this.projectRoot);
    if (instructions.providers) {
      instructions.providers.forEach((provider) => rcFile.addProvider(provider));
    }

    if (instructions.consoleProviders) {
      instructions.consoleProviders.forEach((provider) => rcFile.addAceProvider(provider));
    }

    if (instructions.testProviders) {
      instructions.testProviders.forEach((provider) => rcFile.addTestProvider(provider));
    }

    rcFile.commit();

    if (instructions.providers) {
      const suffix = this.getSuffix(this.formatArray(instructions.providers), 'providers');
      this.logger.action('update').succeeded(`package.json ${suffix}`);
    }

    if (instructions.consoleProviders) {
      const suffix = this.getSuffix(this.formatArray(instructions.consoleProviders), 'consoleProviders');
      this.logger.action('update').succeeded(`package.json ${suffix}`);
    }

    if (instructions.testProviders) {
      const suffix = this.getSuffix(this.formatArray(instructions.testProviders), 'testProviders');
      this.logger.action('update').succeeded(`package.json ${suffix}`);
    }
  }

  /**
   * Executes the instructions fn exposed by the package inside package.json file.
   */
  private async runInstructions(instructions: PackageInstructionsBlock) {
    if (!instructions.instructions) {
      return;
    }

    /**
     * Path to the instructions file is resolved from the package root.
     */
    const instructionsPath = resolveFrom(dirname(this.packagePath), instructions.instructions);

    /**
     * Requiring and executing instructions file
     */
    const instructionsFn = esmRequire(instructionsPath);
    await instructionsFn(this.projectRoot, this.application, {
      ...sink,
      logger: this.logger,
    });
  }

  /**
   * Renders the markdown file if defined inside the package.json file.
   */
  private async renderMarkdownFile(instructions: PackageInstructionsBlock) {
    if (!instructions.instructionsMd || !this.verbose) {
      return;
    }

    if (!this.markdownDisplay) {
      this.logger.info('The package wants to display readable instructions for the setup');
      this.markdownDisplay = await sink.getPrompt().choice('Select where to display instructions', [
        {
          name: 'browser',
          message: 'In the browser',
        },
        {
          name: 'terminal',
          message: 'In the terminal',
        },
      ]);
    }

    /**
     * Render markdown file when `instructionsMd` property is defined in
     * package.json file
     */
    const renderer = new sink.tasks.MarkdownRenderer(
      join(dirname(this.packagePath), instructions.instructionsMd),
      this.packageName
    );

    if (this.markdownDisplay === 'browser') {
      renderer.renderInBrowser();
    } else {
      console.log('');
      renderer.renderInTerminal();
    }
  }

  /**
   * Preset markdown display for avoiding prompt
   */
  public setDisplay(display: 'browser' | 'terminal') {
    this.markdownDisplay = display;
    return this;
  }

  /**
   * Define a custom logger to use
   */
  public useLogger(logger: typeof sink.logger) {
    this.logger = logger;
    return this;
  }

  /**
   * Execute the instructions file
   */
  public async execute() {
    const pkg = this.loadPackageJsonFile();
    if (!pkg.kubit) {
      return true;
    }

    await this.runInstructions(pkg.kubit);
    this.copyTemplates(pkg.kubit);
    this.setEnvVariables(pkg.kubit);
    this.setTypes(pkg.kubit);
    this.setCommands(pkg.kubit);
    this.setAliases(pkg.kubit);
    this.setProviders(pkg.kubit);
    this.setMetaFiles(pkg.kubit);
    this.setPreloads(pkg.kubit);
    await this.renderMarkdownFile(pkg.kubit);
    return true;
  }
}
