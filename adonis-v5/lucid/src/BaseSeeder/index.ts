/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { QueryClientContract } from '@ioc:Kubit/Lucid/Database'

export class BaseSeeder {
  /**
   * @deprecated
   */
  public static developmentOnly: boolean
  public static environment: string[]
  constructor(public client: QueryClientContract) {}

  public async run() {}
}
