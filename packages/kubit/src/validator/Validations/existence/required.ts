import { SyncValidation } from '@ioc:Kubit/Validator';

import { exists, wrapCompile } from '../../Validator/helpers';

const RULE_NAME = 'required';
const DEFAULT_MESSAGE = 'required validation failed';

/**
 * Ensure the value exists. `null`, `undefined` and `empty string`
 * fails the validation
 */
export const required: SyncValidation = {
  compile: wrapCompile(RULE_NAME, [], () => {
    return {
      allowUndefineds: true,
    };
  }),
  validate(value, _, { errorReporter, pointer, arrayExpressionPointer }) {
    if (!exists(value)) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
    }
  },
};
