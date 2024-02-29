/*
 * @kubit/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SchemaFnOptions } from '@ioc:Kubit/Env';
import { Exception } from '@poppinss/utils';

import { BOOLEAN_NEGATIVES, BOOLEAN_POSITIVES, ensureValue } from './helpers';

/**
 * Validates the number to be present in the user defined choices.
 *
 * The incoming value will be casted as follows:
 *
 * - "0", 0, "false", false will be casted to false
 * - "1", 1, "true", true will be casted to true
 * - string representation of a number will be casted to a number
 */
function ensureOneOf(choices: any[], key: string, value: any, message?: string) {
  if (BOOLEAN_NEGATIVES.includes(value)) {
    value = false;
  } else if (BOOLEAN_POSITIVES.includes(value)) {
    value = true;
  } else {
    const toNumber = Number(value);
    if (!isNaN(toNumber)) {
      value = toNumber;
    }
  }

  /**
   * If choices includes the value, then return the casted
   * value
   */
  if (choices.includes(value)) {
    return value;
  }

  /**
   * Otherwise raise exception
   */
  throw new Exception(
    message ||
      `Value for environment variable "${key}" must be one of "${choices.join(',')}", instead received "${value}"`,
    500,
    'E_INVALID_ENV_VALUE'
  );
}

/**
 * Enforces value to be one of the defined choices
 */
export function oneOf(choices: any[], options?: SchemaFnOptions) {
  return function validate(key: string, value?: string) {
    ensureValue(key, value, options?.message);
    return ensureOneOf(choices, key, value, options?.message);
  };
}

/**
 * Similar to oneOf, but also allows optional properties
 */
oneOf.optional = function optionalBoolean(choices: any[], options?: SchemaFnOptions) {
  return function validate(key: string, value?: string) {
    if (!value) {
      return undefined;
    }
    return ensureOneOf(choices, key, value, options?.message);
  };
};
