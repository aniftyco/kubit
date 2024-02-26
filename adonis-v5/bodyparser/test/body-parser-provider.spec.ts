/*
 * @kubit/bodyparser
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { BodyParserMiddleware } from '../src/BodyParser'
import { fs, setupApp } from '../test-helpers'

test.group('BodyParser Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup().catch(() => {})
  })

  test('register bodyparser provider', async ({ assert }) => {
    const app = await setupApp(['../../providers/BodyParserProvider'])
    assert.deepEqual(app.container.use('Kubit/BodyParser'), BodyParserMiddleware)
    assert.instanceOf(
      app.container.make(app.container.use('Kubit/BodyParser')),
      BodyParserMiddleware
    )
  })

  test('extend request class by adding the file methods', async ({ assert }) => {
    const app = await setupApp(['../../providers/BodyParserProvider'])
    assert.deepEqual(app.container.use('Kubit/BodyParser'), BodyParserMiddleware)
    assert.property(app.container.use('Kubit/Request').prototype, 'file')
    assert.property(app.container.use('Kubit/Request').prototype, 'files')
    assert.property(app.container.use('Kubit/Request').prototype, 'allFiles')
  })
})
