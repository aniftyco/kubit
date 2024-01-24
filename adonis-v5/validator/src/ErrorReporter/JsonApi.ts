/*
 * @kubit/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  ErrorReporterContract,
  JsonApiErrorNode,
  MessagesBagContract,
} from '@ioc:Adonis/Core/Validator'

import { ValidationException } from '../ValidationException'

/**
 * The JsonApiErrorReporter formats error messages as per the JSON API spec.
 */
export class JsonApiErrorReporter implements ErrorReporterContract<{ errors: JsonApiErrorNode[] }> {
  private errors: JsonApiErrorNode[] = []

  /**
   * A boolean to know if an error has been reported or
   * not
   */
  public hasErrors = false

  constructor(private messages: MessagesBagContract, private bail: boolean) {}

  /**
   * Report a new error
   */
  public report(
    pointer: string,
    rule: string,
    message: string,
    arrayExpressionPointer?: string,
    args?: any
  ) {
    this.hasErrors = true

    this.errors.push({
      code: rule,
      source: {
        pointer,
      },
      title: this.messages.get(pointer, rule, message, arrayExpressionPointer, args),
      ...(args ? { meta: args } : {}),
    })

    /**
     * Raise exception right away when `bail=true`.
     */
    if (this.bail) {
      throw this.toError()
    }
  }

  /**
   * Returns an instance of [[ValidationException]]
   */
  public toError() {
    return new ValidationException(false, this.toJSON())
  }

  /**
   * Return errors
   */
  public toJSON() {
    return {
      errors: this.errors,
    }
  }
}
