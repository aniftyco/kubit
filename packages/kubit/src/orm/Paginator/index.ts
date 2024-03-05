import { CherryPick, ModelPaginatorContract } from '@ioc:Kubit/ORM';

import { SimplePaginator } from '../../database/Paginator/SimplePaginator';

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
    };
  }
}
