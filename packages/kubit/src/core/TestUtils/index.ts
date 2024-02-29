import { Macroable } from 'macroable';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { TestUtilsContract } from '@ioc:Kubit/TestUtils';

import { loadAceCommands } from '../utils';
import { TestHttpServer } from './HttpServer';

/**
 * Test utils module is meant to be extended to add custom
 * utilities required for testing AdonisJS applications.
 */
export class TestUtils extends Macroable implements Omit<TestUtilsContract, 'constructor' | 'db'> {
  public static macros = {};
  public static getters = {};

  constructor(public application: ApplicationContract) {
    super();
  }

  /**
   * Utilities for ace
   */
  public ace() {
    return {
      loadCommands: () => {
        return loadAceCommands(this.application, this.application.container.resolveBinding('Kubit/Ace'));
      },
    };
  }

  /**
   * Utilities for http server
   */
  public httpServer() {
    return new TestHttpServer(this.application);
  }
}
