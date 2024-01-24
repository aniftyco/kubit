/*
 * @kubit/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import { Formats, IntlMessageFormat } from 'intl-messageformat'

import {
  NumberFormatOptions,
  TimeFormatOptions,
  TranslationsFormatterContract,
} from '@ioc:Adonis/Addons/I18n'
import { formatters } from '@poppinss/intl-formatter'

/**
 * Formatters for ICU message. We need the memoized
 * version for performance
 */
const IcuMessageFormatters = {
  getNumberFormat: formatters.number,
  getDateTimeFormat: formatters.date,
  getPluralRules: formatters.plural,
}

/**
 * ICU translations formatter
 */
export class IcuFormatter implements TranslationsFormatterContract {
  /**
   * Custom formats to be used inside the ICU messages
   */
  private static customFormats: Partial<Formats> = {}

  /**
   * Formatter syntax name
   */
  public readonly name: string = 'icu'

  /**
   * Define a custom format for message
   */
  public static addFormat(type: 'number', key: string, options: NumberFormatOptions): void
  public static addFormat(type: 'date', key: string, options: Intl.DateTimeFormatOptions): void
  public static addFormat(type: 'time', key: string, options: TimeFormatOptions): void
  public static addFormat(
    type: 'number' | 'date' | 'time',
    key: string,
    options: NumberFormatOptions | Intl.DateTimeFormatOptions | TimeFormatOptions
  ): void {
    switch (type) {
      case 'number':
        this.customFormats.number = this.customFormats.number || {}
        this.customFormats.number[key] = options
        break
      case 'date':
        this.customFormats.date = this.customFormats.date || {}
        this.customFormats.date[key] = options
        break
      case 'time':
        this.customFormats.time = this.customFormats.time || {}
        this.customFormats.time[key] = options
        break
    }
  }

  /**
   * Formats an ICU message string
   */
  public format(message: string, locale: string, data?: Record<string, any>): string {
    return new IntlMessageFormat(message, locale, this.constructor['customFormats'], {
      /**
       * Disabling type-checking here since https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat accepts "exceptZero" as the
       * "signSymbol" but TypeScript bundled definition doesn't have it
       */
      formatters: IcuMessageFormatters as any,
      ignoreTag: true,
    }).format(data || {})
  }
}
