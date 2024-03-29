import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const DEFAULT_MESSAGE = 'number validation failed';
const RULE_NAME = 'number';

/**
 * Ensure the value is a valid number. Numeric string will be casted
 * to valid numbers
 */
export const number: SyncValidation = {
  compile: wrapCompile(RULE_NAME),
  validate(value, _, { mutate, errorReporter, pointer, arrayExpressionPointer }) {
    if (typeof value === 'number') {
      return;
    }

    /**
     * Report error when value is not a number and neither a string
     */
    if (typeof value !== 'string') {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
      return;
    }

    /**
     * Attempt to cast number like string to a number. In case of
     * failure report the validation error
     */
    const castedValue = Number(value);
    if (isNaN(castedValue)) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
      return;
    }

    if (castedValue === Infinity || castedValue === -Infinity) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
      return;
    }

    /**
     * Mutate the value
     */
    mutate(castedValue);
  },
};
