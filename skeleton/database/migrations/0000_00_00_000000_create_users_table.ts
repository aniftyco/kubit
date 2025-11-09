import { Migration, schema } from "@app:db";

export default class extends Migration {
  async up() {
    return schema.createTable("users", (table) => {
      table.uuid("id").primary();

      table.string("name");
      table.string("email").unique().index();
      table.string("password");
      table.rememberToken();

      table.timestamps();
    });
  }

  async down() {
    return schema.dropTableIfExists("users");
  }
}
