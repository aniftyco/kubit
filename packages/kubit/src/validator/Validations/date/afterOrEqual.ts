import { SyncValidation } from '@ioc:Kubit/Validator';

import { wrapCompile } from '../../Validator/helpers';
import { compile, CompileReturnType, validate } from './helpers/offset';

const RULE_NAME = 'afterOrEqual';
const DEFAULT_MESSAGE = 'afterOrEqual date validation failed';

/**
 * Ensure the value is one of the defined choices
 */
export const afterOrEqual: SyncValidation<CompileReturnType> = {
  compile: wrapCompile<CompileReturnType>(RULE_NAME, ['date'], (options: any[]) => {
    return compile(RULE_NAME, '>=', options);
  }),
  validate(value, compiledOptions, runtimeOptions) {
    return validate(RULE_NAME, DEFAULT_MESSAGE, value, compiledOptions, runtimeOptions);
  },
};
