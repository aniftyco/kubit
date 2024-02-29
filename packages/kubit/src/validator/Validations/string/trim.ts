import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const RULE_NAME = 'trim';

/**
 * Trim string value
 */
export const trim: SyncValidation<undefined> = {
  compile: wrapCompile(RULE_NAME, [], () => {
    return {
      name: 'trim',
      async: false,
      allowUndefineds: false,
      compiledOptions: undefined,
    };
  }),
  validate(value, _, { mutate }) {
    if (typeof value !== 'string') {
      return;
    }

    mutate(value.trim());
  },
};
