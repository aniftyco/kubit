import { default as escapeValue } from 'validator/lib/escape';

import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const RULE_NAME = 'escape';

/**
 * Escape string value
 */
export const escape: SyncValidation<undefined> = {
  compile: wrapCompile(RULE_NAME, [], () => {
    return {
      name: 'escape',
      async: false,
      allowUndefineds: false,
      compiledOptions: undefined,
    };
  }),
  validate(value, _, { mutate }) {
    if (typeof value !== 'string') {
      return;
    }

    mutate(escapeValue(value));
  },
};
