import { logger, sticker } from '@poppinss/cliui';

import { Kernel } from '../../../../ace';
import { SerializedCommand } from '../../../../ace/Contracts';
import { AppKernel } from '../../Kernel';

/**
 * A local list of assembler commands. We need this, so that when assembler
 * is not installed (probably in production) and someone is trying to
 * build the project by running `serve` or `build`, we should give
 * them a better descriptive error.
 *
 * Also, do note that at times this list will be stale, but we get it back
 * in sync over time.
 */
const ASSEMBLER_COMMANDS = [
  'build',
  'serve',
  'invoke',
  'make:command',
  'make:controller',
  'make:exception',
  'make:listener',
  'make:middleware',
  'make:prldfile',
  'make:provider',
  'make:validator',
  'make:view',
];

/**
 * Exposes the API to execute app commands registered under
 * the manifest file.
 */
export class App {
  private commandName: string;

  /**
   * Returns a boolean if mentioned command is an assembler
   * command
   */
  private get isAssemblerCommand() {
    return ASSEMBLER_COMMANDS.includes(this.commandName);
  }

  /**
   * Reference to the app kernel
   */
  private kernel = new AppKernel(this.appRoot, 'console');

  /**
   * Reference to the console kernel
   */
  private console = new Kernel(this.kernel.application);

  /**
   * Source root always points to the compiled source
   * code.
   */
  constructor(private appRoot: string) {}

  /**
   * Print commands help
   */
  private printHelp(value?: any, command?: any) {
    if (!value) {
      return;
    }

    this.console.printHelp(command);
    process.exit(0);
  }

  /**
   * Print framework version
   */
  private printVersion(value?: any) {
    if (!value) {
      return;
    }

    const appVersion = this.kernel.application.version;
    const kubitVersion = this.kernel.application.kubitVersion;

    sticker()
      .heading('node ace --version')
      .add(`Kubit: ${logger.colors.cyan(kubitVersion ? kubitVersion.version : 'NA')}`)
      .add(`App: ${logger.colors.cyan(appVersion ? appVersion.version : 'NA')}`)
      .render();

    process.exit(0);
  }

  /**
   * Invoked before command source will be read from the
   * disk
   */
  private async onFind(command: SerializedCommand | null) {
    if (!command) {
      return;
    }

    /**
     * Register ts hook when
     *
     * - Haven't registered it already
     * - Is a typescript project
     * - Is not an assembler command
     */
    if (!this.isAssemblerCommand) {
      this.kernel.registerTsCompilerHook();
    }

    /**
     * Only main command can load the application or switch
     * the environment.
     *
     * If a sub-command needs application, then the main command
     * should set "loadApp" to true as well.
     */
    if (command.commandName === this.commandName || command.aliases.includes(this.commandName)) {
      /**
       * Switch environment before wiring the app
       */
      if (command.settings.environment) {
        this.kernel.application.switchEnvironment(command.settings.environment);
      }

      if (command.settings.loadApp) {
        /**
         * Set ace instance within the container, so that the underlying
         * commands or the app can access it from the container
         */
        this.kernel.application.container.singleton('Kubit/Console', () => this.console);
        await this.kernel.boot();
      }
    }
  }

  /**
   * Invoked before command is about to run.
   */
  private async onRun() {
    if (this.kernel.hasBooted) {
      await this.kernel.start();
    }
  }

  /**
   * Hooks into ace lifecycle events to conditionally
   * load the app.
   */
  private registerConsoleHooks() {
    this.console.before('find', async (command) => this.onFind(command));
    this.console.before('run', async () => this.onRun());
  }

  /**
   * Adding flags
   */
  private registerConsoleFlags() {
    /**
     * Showing help including core commands
     */
    this.console.flag('help', async (value, _, command) => this.printHelp(value, command), {
      alias: 'h',
    });

    /**
     * Showing app and Kubit version
     */
    this.console.flag('version', async (value) => this.printVersion(value), { alias: 'v' });
  }

  /**
   * Handle application command
   */
  public async handle(argv: string[]) {
    try {
      /**
       * Define ace hooks to wire the application (if required)
       */
      this.registerConsoleHooks();

      /**
       * Define global flags
       */
      this.registerConsoleFlags();

      /**
       * Print help when no arguments have been passed
       */
      if (!argv.length) {
        this.printHelp(true);
        return;
      }

      /**
       * Hold reference to the command name. We will use this to decide whether
       * or not to exit the process forcefully after the command has been
       * executed
       */
      this.commandName = argv[0];

      /**
       * Listen for the exit signal on ace kernel
       */
      this.console.onExit(async () => {
        if (this.kernel.hasBooted) {
          await this.kernel.close();
        }

        if (!this.console.error) {
          process.exit(this.console.exitCode);
        }

        return this.kernel.handleError(this.console.error).finally(() => process.exit(this.console.exitCode));
      });

      /**
       * Handle command
       */
      await this.console.handle(argv);
    } catch (error) {
      if (!error) {
        process.exit(1);
      }
      this.kernel.handleError(error).finally(() => process.exit(1));
    }
  }
}
