import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { DnsPrefetchOptions } from '@ioc:Kubit/Security';

import { noop } from './noop';

/**
 * Factory that returns a function to set `X-DNS-Prefetch-Control` header.
 */
export function dnsPrefetchFactory(options: DnsPrefetchOptions) {
  if (!options.enabled) {
    return noop;
  }

  const value = options.allow ? 'on' : 'off';

  return function dnsPrefetch({ response }: HttpContextContract) {
    response.header('X-DNS-Prefetch-Control', value);
  };
}
