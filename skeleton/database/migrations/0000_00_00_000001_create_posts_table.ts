import { Migration, schema } from 'kubit:db';
import { User } from '@app/models/user';

export default class extends Migration {
  async up() {
    return schema.createTable('posts', (table) => {
      table.uuid('id').primary();
      table.foreignIdFor(User);

      table.string('title');
      table.text('body');

      table.timestamps();
      table.softDeletes();
    });
  }

  async down() {
    return schema.dropTableIfExists('posts');
  }
}
