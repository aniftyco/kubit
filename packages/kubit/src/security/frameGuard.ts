import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { XFrameOptions } from '@ioc:Kubit/Security';

import { noop } from './noop';

const ALLOWED_ACTIONS = ['DENY', 'ALLOW-FROM', 'SAMEORIGIN'];

/**
 * Factory function that returns a function to set `X-Frame-Options` header
 * based upon given user options.
 */
export function frameGuardFactory(options: XFrameOptions) {
  if (!options.enabled) {
    return noop;
  }

  const action = ((options.action || 'SAMEORIGIN').toUpperCase() as typeof options.action)!;
  if (!ALLOWED_ACTIONS.includes(action)) {
    throw new Error('frameGuard: Action must be one of "DENY", "ALLOW-FROM" or "SAMEORGIGIN"');
  }

  if (action === 'ALLOW-FROM' && !options['domain']) {
    throw new Error('frameGuard: Domain value is required when using action as "ALLOW-FROM"');
  }

  const result = action === 'ALLOW-FROM' ? `${action} ${options['domain']}` : action;
  return function frameGuard({ response }: HttpContextContract) {
    response.header('X-Frame-Options', result);
  };
}
