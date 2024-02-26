/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import { CherryPick, ModelPaginatorContract } from '@ioc:Kubit/Lucid/Orm'

import { SimplePaginator } from '../../Database/Paginator/SimplePaginator'

/**
 * Model paginator extends the simple paginator and adds support for
 * serializing models as well
 */
export class ModelPaginator extends SimplePaginator implements ModelPaginatorContract<any> {
  /**
   * Serialize models
   */
  public serialize(cherryPick?: CherryPick) {
    return {
      meta: this.getMeta(),
      data: this.all().map((row) => row.serialize(cherryPick)),
    }
  }
}
