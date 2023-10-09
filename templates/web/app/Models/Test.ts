import { DateTime } from 'luxon';

import { compose } from '@ioc:Adonis/Core/Helpers';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';
import { UsesUuids } from '@ioc:Kubit/Support';

export default class Test extends compose(BaseModel, UsesUuids) {
  @column({ isPrimary: true })
  public id: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
