import { join } from 'path';

import { bootConfig } from '../../application';
import { iocTransformer } from '../../ioc-transformer';
import { RCFILE_NAME } from '../config/paths';

import type tsStatic from 'typescript';
/**
 * Transformer to transform Kubit IoC container import
 * statements
 */
export default function (ts: typeof tsStatic, appRoot: string) {
  return iocTransformer(ts, bootConfig.parse(require(join(appRoot, RCFILE_NAME))));
}
