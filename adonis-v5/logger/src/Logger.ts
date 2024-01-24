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
import abstractLogging from 'abstract-logging'
import { LoggerConfig, LoggerContract } from '@ioc:Adonis/Core/Logger'

import { getPino } from './getPino'

const STATIC_LEVELS = {
  labels: {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  },
  values: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10,
  },
}

/**
 * Logger class built on top of pino with couple of changes in
 * the configuration. You can access the underlying `pino`
 * object using `logger.pino`.
 */
export class Logger implements LoggerContract {
  public pino: Pino.Logger

  constructor(protected config: LoggerConfig, pino?: Pino.Logger) {
    if (!this.config.enabled) {
      this.pino = abstractLogging
    } else {
      this.pino = pino || getPino(this.config)
    }
  }

  /**
   * A map of levels
   */
  public get levels(): Pino.LevelMapping {
    if (!this.config.enabled) {
      return STATIC_LEVELS
    }
    return this.pino.levels
  }

  /**
   * Returns the current logger level
   */
  public get level(): string {
    if (!this.config.enabled) {
      return this.config.level
    }

    return this.pino.level
  }

  /**
   * Update logger level
   */
  public set level(level: string) {
    if (!this.config.enabled) {
      this.config.level = level
      return
    }

    this.pino.level = level
  }

  /**
   * Returns the current logger level number
   */
  public get levelNumber(): number {
    if (!this.config.enabled) {
      return STATIC_LEVELS.values[this.config.level]
    }

    return this.pino.levelVal
  }

  /**
   * Returns the pino version
   */
  public get pinoVersion(): string {
    return (Pino as any).version
  }

  /**
   * Returns a boolean telling if level is enabled or
   * not.
   */
  public isLevelEnabled(level: string): boolean {
    if (!this.config.enabled) {
      return false
    }

    return this.pino.isLevelEnabled(level)
  }

  /**
   * Log message for any named level
   */
  public log(level: string, message: string, ...values: any[]): void
  public log(level: string, mergingObject: any, message: string, ...values: any[]): void
  public log(level: string, mergingObject: any, message: string, ...values: any[]): void {
    if (values.length) {
      this.pino[level](mergingObject, message, ...values)
    } else if (message) {
      this.pino[level](mergingObject, message)
    } else {
      this.pino[level](mergingObject)
    }
  }

  /**
   * Log message at trace level
   */
  public trace(message: string, ...values: any[]): void
  public trace(mergingObject: any, message: string, ...values: any[]): void
  public trace(mergingObject: any, message: string, ...values: any[]): void {
    this.log('trace', mergingObject, message, ...values)
  }

  /**
   * Log message at debug level
   */
  public debug(message: string, ...values: any[]): void
  public debug(mergingObject: any, message: string, ...values: any[]): void
  public debug(mergingObject: any, message: string, ...values: any[]): void {
    this.log('debug', mergingObject, message, ...values)
  }

  /**
   * Log message at info level
   */
  public info(message: string, ...values: any[]): void
  public info(mergingObject: any, message: string, ...values: any[]): void
  public info(mergingObject: any, message: string, ...values: any[]): void {
    this.log('info', mergingObject, message, ...values)
  }

  /**
   * Log message at warn level
   */
  public warn(message: string, ...values: any[]): void
  public warn(mergingObject: any, message: string, ...values: any[]): void
  public warn(mergingObject: any, message: string, ...values: any[]): void {
    this.log('warn', mergingObject, message, ...values)
  }

  /**
   * Log message at error level
   */
  public error(message: string, ...values: any[]): void
  public error(mergingObject: any, message: string, ...values: any[]): void
  public error(mergingObject: any, message: string, ...values: any[]): void {
    this.log('error', mergingObject, message, ...values)
  }

  /**
   * Log message at fatal level
   */
  public fatal(message: string, ...values: any[]): void
  public fatal(mergingObject: any, message: string, ...values: any[]): void
  public fatal(mergingObject: any, message: string, ...values: any[]): void {
    this.log('fatal', mergingObject, message, ...values)
  }

  /**
   * Returns a child logger instance
   */
  public child(
    bindings: {
      serializers?: { [key: string]: Pino.SerializerFn }
      [key: string]: any
    },
    options?: {
      level?: Pino.Level | string
      redact?: string[] | Pino.redactOptions
      serializers?: { [key: string]: Pino.SerializerFn }
    }
  ) {
    if (!this.config.enabled) {
      return this
    }

    return new Logger(this.config, (this.pino.child as any)(bindings, options))
  }

  /**
   * Returns default bindings for the logger
   */
  public bindings(): Pino.Bindings {
    if (!this.config.enabled) {
      return {}
    }

    return this.pino.bindings()
  }
}
