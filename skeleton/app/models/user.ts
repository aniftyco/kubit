import { DateTime } from "datetime";
import {
  Model,
  column,
  before,
  use,
  SoftDeletes,
  hasMany,
  HasMany,
} from "kubit:orm";
import { hash } from "kubit:hash";
import { Post } from "@app/models/post";

@use(SoftDeletes)
export class User extends Model {
  @column({ primary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public email: string;

  @column({ visible: false })
  public password: string;

  @column()
  public rememberMeToken: string | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public deletedAt: DateTime | null;

  @hasMany(() => Post)
  public posts: HasMany<typeof Post>;

  @before("save")
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash(user.password);
    }
  }
}
