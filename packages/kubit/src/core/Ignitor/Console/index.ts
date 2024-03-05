import { App } from './App';

/**
 * Exposes the API to execute console commands.
 */
export class Console {
  constructor(private appRoot: string) {}

  /**
   * Handles the console command
   */
  public async handle(argv: string[]) {
    process.env.KUBIT_CONSOLE_CWD = this.appRoot;

    /**
     * Proxy over to application commands
     */
    await new App(this.appRoot).handle(argv);
  }
}
