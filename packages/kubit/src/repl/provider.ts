import { homedir } from 'os';
import { join } from 'path';

import { ApplicationContract } from '@ioc:Kubit/Application';

import { ServiceProvider } from '../index';

export default class ReplProvider implements ServiceProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  public register() {
    this.app.container.singleton('Kubit/Repl', () => {
      const compiler = global[Symbol.for('REQUIRE_TS_COMPILER')];
      const { Repl } = require('./Repl');
      return new Repl(compiler, join(homedir(), '.kubit_repl_history'));
    });
  }
}
