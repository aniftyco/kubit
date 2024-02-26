/*
 * @kubit/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path';

import { test } from '@japa/runner';
import { Application } from '@kubit/core/build/standalone';
import { Filesystem } from '@poppinss/dev-utils';

import { Repl } from '../src/Repl';

const fs = new Filesystem(join(__dirname, './app'))

export async function setup() {
  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
		export const appKey = '${Math.random().toFixed(36).substring(2, 38)}',
		export const http = {
			cookie: {},
			trustProxy: () => true,
		}
	`
  )

  const app = new Application(fs.basePath, 'web', {
    providers: ['@kubit/core', '../../providers/ReplProvider'],
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}

test.group('Repl Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register repl provider', async ({ assert }) => {
    const app = await setup()
    assert.instanceOf(app.container.use('Kubit/Repl'), Repl)
  })
})
