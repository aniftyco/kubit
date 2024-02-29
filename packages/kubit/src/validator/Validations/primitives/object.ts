import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const DEFAULT_MESSAGE = 'object validation failed';
const RULE_NAME = 'object';

/**
 * Ensure value is a valid object
 */
export const object: SyncValidation = {
  compile: wrapCompile(RULE_NAME),
  validate(value, _, { errorReporter, pointer, arrayExpressionPointer }) {
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
    }
  },
};
