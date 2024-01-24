/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Emitter } from '../src/Emitter'
import { fs, setUp } from '../test-helpers'

test.group('EventProvider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register event provider', async ({ assert }) => {
    const app = await setUp()

    assert.instanceOf(app.container.use('Adonis/Core/Event'), Emitter)
    assert.deepEqual(app.container.use('Adonis/Core/Event'), app.container.use('Adonis/Core/Event'))
  })
})
