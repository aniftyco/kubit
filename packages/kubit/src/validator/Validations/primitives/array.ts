import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const RULE_NAME = 'array';
const DEFAULT_MESSAGE = 'array validation failed';

/**
 * Ensure value is a valid array
 */
export const array: SyncValidation = {
  compile: wrapCompile(RULE_NAME),
  validate(value, _, { pointer, arrayExpressionPointer, errorReporter }) {
    if (!Array.isArray(value)) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
    }
  },
};
