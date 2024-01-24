/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { register } from './index'

const CWD = process.env.REQUIRE_TS_CWD || process.cwd()
register(CWD, {
  cache: !!process.env.REQUIRE_TS_CACHE,
})
