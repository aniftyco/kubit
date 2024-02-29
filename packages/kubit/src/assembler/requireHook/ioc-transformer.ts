import { join } from 'path';

import { rcParser } from '../../application';
import { iocTransformer } from '../../ioc-transformer';

import type tsStatic from 'typescript';
/**
 * Transformer to transform AdonisJS IoC container import
 * statements
 */
export default function (ts: typeof tsStatic, appRoot: string) {
  return iocTransformer(ts, rcParser.parse(require(join(appRoot, '.adonisrc.json'))));
}
