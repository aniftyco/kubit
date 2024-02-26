/*
 * @kubit/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { HealthCheck } from '../src/HealthCheck'
import { HttpExceptionHandler } from '../src/HttpExceptionHandler'
import { fs, setupApp } from '../test-helpers'

test.group('App Provider', (group) => {
  group.each.teardown(async () => {
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')
    await fs.cleanup()
  })

  test('register app provider', async ({ assert }) => {
    const app = await setupApp([], true)
    assert.isTrue(app.container.hasBinding('Kubit/Env'))
    assert.isTrue(app.container.hasBinding('Kubit/Config'))
    assert.isTrue(app.container.hasBinding('Kubit/Logger'))
    assert.isTrue(app.container.hasBinding('Kubit/Encryption'))
    assert.isTrue(app.container.hasBinding('Kubit/Profiler'))
    assert.isTrue(app.container.hasBinding('Kubit/Request'))
    assert.isTrue(app.container.hasBinding('Kubit/Response'))
    assert.isTrue(app.container.hasBinding('Kubit/Server'))
    assert.isTrue(app.container.hasBinding('Kubit/MiddlewareStore'))
    assert.isTrue(app.container.hasBinding('Kubit/HttpContext'))
    assert.isTrue(app.container.hasBinding('Kubit/Event'))
    assert.isTrue(app.container.hasBinding('Kubit/Hash'))
    assert.isTrue(app.container.hasBinding('Kubit/BodyParser'))
    assert.isTrue(app.container.hasBinding('Kubit/Validator'))
    assert.isTrue(app.container.hasBinding('Kubit/AssetsManager'))
    assert.instanceOf(app.container.use('Kubit/HealthCheck'), HealthCheck)
    assert.deepEqual(app.container.use('Kubit/HttpExceptionHandler'), HttpExceptionHandler as any)

    /**
     * Ensure drive routes are registerd
     */
    const router = app.container.use('Kubit/Route')
    router.commit()
    const routes = router.toJSON()

    assert.deepEqual(routes.root[0].name, 'drive.local.serve')
    assert.deepEqual(routes.root[0].pattern, '/uploads/*')
  })

  test('extend Japa ApiRequest', async ({ assert }) => {
    const app = await setupApp(['@japa/preset-adonis/TestsProvider'], true)
    const ApiRequest = app.container.use('Japa/Preset/ApiRequest')
    assert.isTrue(ApiRequest.hasMacro('encryptedCookie'))
    assert.isTrue(ApiRequest.hasMacro('plainCookie'))
  })
})
