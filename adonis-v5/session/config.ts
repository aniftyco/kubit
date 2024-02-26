/**
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SessionConfig } from '@ioc:Kubit/Session';

/**
 * Helper to define session config
 */
export function sessionConfig<Config extends SessionConfig>(config: Config): Config {
  return config
}
