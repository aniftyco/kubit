/*
 * @kubit/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CompilerOutput } from '@ioc:Adonis/Core/Validator'

import { VanillaErrorReporter } from '../src/ErrorReporter/Vanilla'
import { MessagesBag } from '../src/MessagesBag'
import * as validations from '../src/Validations'
import { exists, isObject } from '../src/Validator/helpers'

const helpers = { exists, isObject }

export function validate(fn: CompilerOutput<any>, data: any) {
  return fn(data, validations, new VanillaErrorReporter(new MessagesBag({}), true), helpers, {})
}
