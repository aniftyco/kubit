import escape from 'validator/lib/escape';

import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const DEFAULT_MESSAGE = 'string validation failed';
const RULE_NAME = 'string';

/**
 * Ensure value is a valid string
 * @type {SyncValidation}
 */
export const string: SyncValidation<{ escape: boolean; trim: boolean }> = {
  compile: wrapCompile(RULE_NAME, [], ([options]) => {
    return {
      compiledOptions: {
        escape: !!(options && options.escape),
        trim: !!(options && options.trim),
      },
    };
  }),
  validate(value, compiledOptions, { pointer, errorReporter, arrayExpressionPointer, mutate }) {
    if (typeof value !== 'string') {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
      return;
    }

    let mutated = false;

    /**
     * Escape string
     */
    if (compiledOptions.escape) {
      mutated = true;
      value = escape(value);
    }

    /**
     * Trim whitespaces
     */
    if (compiledOptions.trim) {
      mutated = true;
      value = value.trim();
    }

    mutated && mutate(value);
  },
};
