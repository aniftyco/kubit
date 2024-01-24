/*
 * @adonisjs/logger
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Logger' {
  import {
    Level,
    TimeFn,
    redactOptions,
    PrettyOptions,
    SerializerFn,
    LevelMapping,
    Bindings,
    DestinationStream,
  } from 'pino'

  /**
   * The formatters accepted by pino
   */
  export type Formatters = {
    level?(labelName: string, labelNumber: number): Object
    bindings?(bindings: Bindings): Object
    log?(log: Object): Object
  }

  export type TimestampKeywords = 'iso' | 'unix' | 'epoch'

  /**
   * Config shape
   */
  export type LoggerConfig = {
    name: string
    level: Level | 'silent' | string
    enabled: boolean
    messageKey?: string
    safe?: boolean
    crlf?: boolean
    timestamp?: TimeFn | TimestampKeywords | boolean
    customLevels?: {
      [key: string]: number
    }
    formatters?: Formatters
    useOnlyCustomLevels?: boolean
    redact?: string[] | redactOptions
    prettyPrint?: boolean | PrettyOptions
    base?: { [key: string]: any } | null
    serializers?: { [key: string]: SerializerFn }
    stream?: DestinationStream
  } & { [key: string]: any }

  /**
   * Logger interface that main and fake logger implements
   */
  export interface LoggerContract {
    level: string
    levelNumber: number
    levels: LevelMapping
    pinoVersion: string

    log(level: string, message: string, ...values: any[]): void
    log(level: string, mergingObject: any, message: string, ...values: any[]): void

    trace(message: string, ...values: any[]): void
    trace(mergingObject: any, message: string, ...values: any[]): void

    debug(message: string, ...values: any[]): void
    debug(mergingObject: any, message: string, ...values: any[]): void

    info(message: string, ...values: any[]): void
    info(mergingObject: any, message: string, ...values: any[]): void

    warn(message: string, ...values: any[]): void
    warn(mergingObject: any, message: string, ...values: any[]): void

    error(message: string, ...values: any[]): void
    error(mergingObject: any, message: string, ...values: any[]): void

    fatal(message: string, ...values: any[]): void
    fatal(mergingObject: any, message: string, ...values: any[]): void

    isLevelEnabled(level: string): boolean
    bindings(): Bindings
    child(
      bindings: {
        serializers?: { [key: string]: SerializerFn }
        [key: string]: any
      },
      options?: {
        level?: Level | string
        redact?: string[] | redactOptions
        serializers?: { [key: string]: SerializerFn }
      }
    ): LoggerContract
  }

  const Logger: LoggerContract
  export default Logger
}
