import { Macroable } from 'macroable';

import { ApplicationContract } from '@ioc:Kubit/Application';
import { TestUtilsContract } from '@ioc:Kubit/TestUtils';

import { TestHttpServer } from './HttpServer';

/**
 * Test utils module is meant to be extended to add custom
 * utilities required for testing Kubit applications.
 */
export class TestUtils extends Macroable implements Omit<TestUtilsContract, 'constructor' | 'db' | 'ace'> {
  public static macros = {};
  public static getters = {};

  constructor(public application: ApplicationContract) {
    super();
  }

  /**
   * Utilities for http server
   */
  public httpServer() {
    return new TestHttpServer(this.application);
  }
}
