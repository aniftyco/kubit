import { EnvSchema } from '@ioc:Kubit/Env';

import { boolean } from './boolean';
import { number } from './number';
import { oneOf } from './oneOf';
import { string } from './string';

export const schema: EnvSchema = {
  number,
  string,
  boolean,
  enum: oneOf,
};
