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
import { LoggerConfig, TimestampKeywords } from '@ioc:Adonis/Core/Logger'

/**
 * Mapping pino timestamp formatters to keywords
 */
const TimestampFormatters: { [Keyword in TimestampKeywords]: () => string } = {
  iso: Pino.stdTimeFunctions.isoTime,
  epoch: Pino.stdTimeFunctions.epochTime,
  unix: Pino.stdTimeFunctions.unixTime,
}

/**
 * Returns an instance of pino logger by adjusting the config options
 */
export function getPino(options: LoggerConfig): Pino.Logger {
  const pinoOptions = Object.assign({}, options)

  /**
   * Use pino formatters when a keyword is used
   */
  if (
    pinoOptions.timestamp &&
    typeof pinoOptions.timestamp === 'string' &&
    TimestampFormatters[pinoOptions.timestamp]
  ) {
    pinoOptions.timestamp = TimestampFormatters[pinoOptions.timestamp]
  }

  return options.stream ? Pino(pinoOptions as any, options.stream) : Pino(pinoOptions as any)
}
