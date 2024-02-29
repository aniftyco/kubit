import type { TestUtilsContract } from '@ioc:Kubit/TestUtils';

import type Ace from '@ioc:Kubit/Ace';

import { TestsMigrator } from '../TestUtils/Migration';
import { TestsSeeder } from '../TestUtils/Seeder';
import { TestsTruncator } from '../TestUtils/Truncator';

/**
 * Define database testing utilities
 */
export function defineTestUtils(testUtils: TestUtilsContract, ace: typeof Ace) {
  testUtils.constructor.macro('db', (connectionName?: string) => {
    return {
      migrate() {
        return new TestsMigrator(ace, connectionName).run();
      },
      seed() {
        return new TestsSeeder(ace, connectionName).run();
      },
      truncate() {
        return new TestsTruncator(ace, connectionName).run();
      },
    };
  });
}
