/*
 * @adonisjs/logger
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/logger.ts" />

import Pino from 'pino'
import { LoggerConfig } from '@ioc:Adonis/Core/Logger'

import { Logger } from './Logger'

/**
 * Fake logger that sets a custom logger stream and returns
 * the log messages as an array vs writing them to `stdout`.
 */
export class FakeLogger extends Logger {
  constructor(config: LoggerConfig, pino?: Pino.Logger) {
    /**
     * Config is only used when we are not receiving an
     * existing instance of pino.
     */
    if (!pino) {
      const cloned = Object.assign({}, config, {
        prettyPrint: false,
        stream: {
          logs: [],
          write: function writer(line: string) {
            const log = JSON.parse(line)
            delete log.timestamp
            this.logs.push(log)
          },
        },
      })
      super(cloned)
    } else {
      super(config, pino)
    }
  }

  /**
   * An array of in-memory logs
   */
  public get logs(): any[] {
    return (this.config.stream as any).logs
  }

  /**
   * Returns the child fake logger. All logs from the child
   * are writte to the same top level stream
   */
  public child(bindings: {
    level?: Pino.Level | string
    serializers?: { [key: string]: Pino.SerializerFn }
    [key: string]: any
  }) {
    if (!this.config.enabled) {
      return this
    }
    return new FakeLogger(this.config, this.pino.child(bindings))
  }

  /**
   * Clear in-memory logs
   */
  public clear() {
    ;(this.config.stream as any).logs = []
  }
}
