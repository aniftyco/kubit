/*
 * @kubit/session
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/session.ts" />

import { createServer } from 'http'
import supertest from 'supertest'

import { test } from '@japa/runner'

import { CookieDriver } from '../src/Drivers/Cookie'
import { decryptCookie, encryptCookie, fs, sessionConfig, setup } from '../test-helpers'

test.group('Cookie driver', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('return null object when cookie is missing', async ({ assert }) => {
    assert.plan(1)

    const app = await setup()
    const sessionId = '1234'

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)
      const session = new CookieDriver(sessionConfig, ctx)
      const value = session.read(sessionId)
      assert.isNull(value)
      res.end()
    })

    await supertest(server).get('/')
  })

  test('return empty object when cookie value is invalid', async ({ assert }) => {
    assert.plan(1)

    const app = await setup()
    const sessionId = '1234'

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)
      const session = new CookieDriver(sessionConfig, ctx)
      const value = session.read(sessionId)
      assert.isNull(value)
      res.end()
    })

    await supertest(server).get('/').set('cookie', '1234=hello-world')
  })

  test('return cookie values as an object', async ({ assert }) => {
    const app = await setup()
    const sessionId = '1234'

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)

      const session = new CookieDriver(sessionConfig, ctx)
      const value = session.read(sessionId)

      res.writeHead(200, { 'content-type': 'application/json' })
      res.write(JSON.stringify(value))
      res.end()
    })

    const { body } = await supertest(server)
      .get('/')
      .set('cookie', encryptCookie(app, { message: 'hello-world' }, sessionId))

    assert.deepEqual(body, { message: 'hello-world' })
  })

  test('write cookie value', async ({ assert }) => {
    const app = await setup()
    const sessionId = '1234'

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)

      const session = new CookieDriver(sessionConfig, ctx)
      session.write(sessionId, { message: 'hello-world' })

      ctx.response.send('')
      ctx.response.finish()
    })

    const { header } = await supertest(server).get('/')
    assert.deepEqual(decryptCookie(app, header, sessionId), { message: 'hello-world' })
  })

  test('update cookie with existing value', async ({ assert }) => {
    const app = await setup()
    const sessionId = '1234'

    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Kubit/HttpContext').create('/', {}, req, res)

      const session = new CookieDriver(sessionConfig, ctx)
      session.touch(sessionId)

      ctx.response.send('')
      ctx.response.finish()
    })

    const { header } = await supertest(server)
      .get('/')
      .set('cookie', encryptCookie(app, { message: 'hello-world' }, sessionId))

    assert.deepEqual(decryptCookie(app, header, sessionId), { message: 'hello-world' })
  })
})
