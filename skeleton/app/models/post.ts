import { DateTime } from "datetime";
import { Model, column, use, hasOne, SoftDeletes, HasOne } from "kubit:orm";
import { User } from "@app/models/user";

@use(SoftDeletes)
export class Post extends Model {
  @column({ primary: true })
  public id: number;

  @hasOne(() => User)
  public author: HasOne<typeof User>;

  @column()
  public title: string;

  @column()
  public body: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public deletedAt: DateTime | null;
}
