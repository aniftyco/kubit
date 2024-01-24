/*
 * @kubit/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'

import { rcParser } from '@kubit/application'
import { iocTransformer } from '@kubit/ioc-transformer'

import type tsStatic from 'typescript'
/**
 * Transformer to transform AdonisJS IoC container import
 * statements
 */
export default function (ts: typeof tsStatic, appRoot: string) {
  return iocTransformer(ts, rcParser.parse(require(join(appRoot, '.adonisrc.json'))))
}
