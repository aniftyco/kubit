import { App } from './App';

/**
 * Exposes the API to execute ace commands.
 */
export class Ace {
  constructor(private appRoot: string) {}

  /**
   * Handles the ace command
   */
  public async handle(argv: string[]) {
    process.env.ADONIS_ACE_CWD = this.appRoot;

    /**
     * Proxy over to application commands
     */
    await new App(this.appRoot).handle(argv);
  }
}
