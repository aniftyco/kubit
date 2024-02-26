/*
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer } from 'http';

import { ApiClient } from '@japa/api-client';
import { test } from '@japa/runner';

import { MemoryDriver } from '../src/Drivers/Memory';
import { SessionManager } from '../src/SessionManager';
import { fs, setup } from '../test-helpers';

test.group('Session Provider', (group) => {
  group.each.teardown(async () => {
    ApiClient.clearSetupHooks()
    ApiClient.clearTeardownHooks()
    ApiClient.clearRequestHandlers()
    await fs.cleanup()
  })

  test('register session provider', async ({ assert }) => {
    const app = await setup({
      driver: 'cookie',
    })

    assert.instanceOf(app.container.use('Kubit/Session'), SessionManager)
    assert.deepEqual(app.container.use('Kubit/Session'), app.container.use('Kubit/Session'))
    assert.deepEqual(app.container.use('Kubit/Session')['application'], app)
    assert.equal(app.container.use('Kubit/Server').hooks['hooks'].before.length, 1)
    assert.equal(app.container.use('Kubit/Server').hooks['hooks'].after.length, 1)
  })

  test('raise error when config is missing', async ({ assert }) => {
    assert.plan(1)

    try {
      await setup({})
    } catch (error) {
      assert.equal(
        error.message,
        'Invalid "session" config. Missing value for "driver". Make sure to set it inside the "config/session" file'
      )
    }
  })

  test('do not register hooks when session is disabled', async ({ assert }) => {
    const app = await setup({
      enabled: false,
      driver: 'cookie',
    })

    assert.instanceOf(app.container.use('Kubit/Session'), SessionManager)
    assert.deepEqual(app.container.use('Kubit/Session'), app.container.use('Kubit/Session'))
    assert.deepEqual(app.container.use('Kubit/Session')['application'], app)
    assert.equal(app.container.use('Kubit/Server').hooks['hooks'].before.length, 0)
    assert.equal(app.container.use('Kubit/Server').hooks['hooks'].after.length, 0)
  })

  test('register test api request methods', async ({ assert }) => {
    const app = await setup({
      driver: 'cookie',
    })

    assert.instanceOf(app.container.use('Kubit/Session'), SessionManager)
    assert.deepEqual(app.container.use('Kubit/Session'), app.container.use('Kubit/Session'))

    assert.isTrue(app.container.use('Japa/Preset/ApiRequest').hasMacro('session'))
    assert.isTrue(app.container.use('Japa/Preset/ApiRequest').hasMacro('flashMessages'))
    assert.isTrue(app.container.use('Japa/Preset/ApiRequest').hasGetter('sessionClient'))
  })

  test('set session before making the api request', async ({ assert }) => {
    const app = await setup({
      driver: 'memory',
      cookieName: 'adonis-session',
    })

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)
      await ctx.session.initiate(false)

      try {
        ctx.response.send(ctx.session.all())
      } catch (error) {
        ctx.response.status(500).send(error.stack)
      }

      ctx.response.finish()
    })
    server.listen(3333)

    const client = new (app.container.use('Japa/Preset/ApiClient'))('http://localhost:3333')
    const response = await client.get('/').session({ username: 'virk' })
    server.close()

    assert.deepEqual(response.status(), 200)
    assert.deepEqual(response.body(), { username: 'virk' })
  })

  test('get session data from the response', async ({ assert }) => {
    const app = await setup({
      driver: 'memory',
      cookieName: 'adonis-session',
    })

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)

      await ctx.session.initiate(false)
      ctx.session.put('username', 'virk')
      await ctx.session.commit()

      ctx.response.finish()
    })
    server.listen(3333)

    const client = new (app.container.use('Japa/Preset/ApiClient'))('http://localhost:3333', assert)
    const response = await client.get('/')
    server.close()

    assert.equal(MemoryDriver.sessions.size, 0)
    assert.deepEqual(response.status(), 200)

    response.assertSession('username', 'virk')
    response.assertSessionMissing('age')
  })

  test('get flash messages from the response', async ({ assert }) => {
    const app = await setup({
      driver: 'memory',
      cookieName: 'adonis-session',
    })

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)

      await ctx.session.initiate(false)
      ctx.session.flash({ username: 'virk' })
      await ctx.session.commit()

      ctx.response.finish()
    })
    server.listen(3333)

    const client = new (app.container.use('Japa/Preset/ApiClient'))('http://localhost:3333', assert)
    const response = await client.get('/')
    server.close()

    assert.equal(MemoryDriver.sessions.size, 0)
    assert.deepEqual(response.status(), 200)

    response.assertFlashMessage('username', 'virk')
    response.assertFlashMissing('age')
  })

  test('destroy session when request fails', async ({ assert }) => {
    const app = await setup({
      driver: 'memory',
      cookieName: 'adonis-session',
    })

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)

      await ctx.session.initiate(false)
      ctx.session.put('username', 'virk')
      await ctx.session.commit()

      ctx.response.status(500).send('Server error')
      ctx.response.finish()
    })
    server.listen(3333)

    const client = new (app.container.use('Japa/Preset/ApiClient'))('http://localhost:3333', assert)
    await assert.rejects(() => client.get('/'))
    server.close()

    assert.equal(MemoryDriver.sessions.size, 0)
  })
})
