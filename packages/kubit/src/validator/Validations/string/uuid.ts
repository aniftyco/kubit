import isUUID, { UUIDVersion } from 'validator/lib/isUUID';

import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';

const DEFAULT_MESSAGE = 'uuid validation failed';
const RULE_NAME = 'uuid';

/**
 * Validation signature for the "uuid" rule. Non-string values are
 * ignored.
 */
export const uuid: SyncValidation<{ version?: UUIDVersion }> = {
  compile: wrapCompile(RULE_NAME, ['string'], ([options]) => {
    return {
      compiledOptions: {
        version: options && options.version ? options.version : 4,
      },
    };
  }),
  validate(value, compiledOptions, { errorReporter, arrayExpressionPointer, pointer }) {
    /**
     * Ignor non-string values. The user must apply string rule
     * to validate string
     */
    if (typeof value !== 'string') {
      return;
    }

    if (!isUUID(value, compiledOptions.version)) {
      errorReporter.report(pointer, RULE_NAME, DEFAULT_MESSAGE, arrayExpressionPointer);
    }
  },
};
