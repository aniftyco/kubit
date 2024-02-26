/*
 * @kubit/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EnvSchema } from '@ioc:Kubit/Env'

import { boolean } from './boolean'
import { number } from './number'
import { oneOf } from './oneOf'
import { string } from './string'

export const schema: EnvSchema = {
  number,
  string,
  boolean,
  enum: oneOf,
}
