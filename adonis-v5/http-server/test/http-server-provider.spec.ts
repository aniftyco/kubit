/*
 * @kubit/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { CookieClient } from '../src/Cookie/Client'
import { HttpContext } from '../src/HttpContext'
import { MiddlewareStore } from '../src/MiddlewareStore'
import { Request } from '../src/Request'
import { Response } from '../src/Response'
import { Router } from '../src/Router'
import { Server } from '../src/Server'
import { fs, setupApp } from '../test-helpers'

test.group('Http Server Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register http server provider', async ({ assert }) => {
    const app = await setupApp(['@kubit/encryption', '../../providers/HttpServerProvider'])

    assert.instanceOf(app.container.use('Kubit/Route'), Router)
    assert.deepEqual(app.container.use('Kubit/Request'), Request)
    assert.deepEqual(app.container.use('Kubit/Response'), Response)
    assert.instanceOf(app.container.use('Kubit/Server'), Server)
    assert.instanceOf(app.container.use('Kubit/CookieClient'), CookieClient)
    assert.deepEqual(app.container.use('Kubit/MiddlewareStore'), MiddlewareStore)
    assert.deepEqual(app.container.use('Kubit/HttpContext'), HttpContext)
  })
})

test.group('Http Context', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('create fake Http context instance', async ({ assert }) => {
    await setupApp(['@kubit/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/', {})

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/')
    assert.deepEqual(ctx.route!.middleware, [])
  })

  test('compute request url from params', async ({ assert }) => {
    await setupApp(['@kubit/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/:id', { id: '1' })

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })

  test('collect params from route pattern', async ({ assert }) => {
    await setupApp(['@kubit/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/posts/:post/comments/:comment', { post: '1', comment: '1' })

    assert.instanceOf(ctx, HttpContext)
    assert.deepEqual(ctx.route!.params, ['post', 'comment'])
  })

  test('add macro to http context', async ({ assert }) => {
    await setupApp(['@kubit/encryption', '../../providers/HttpServerProvider'])
    HttpContext.macro('url', function url() {
      return `user/${this.params.id}`
    })

    const ctx = HttpContext.create('/:id', { id: '1' })
    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })

  test('pass ctx to request and response', async ({ assert }) => {
    await setupApp(['@kubit/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/', {})
    assert.deepEqual(ctx.request.ctx, ctx)
    assert.deepEqual(ctx.response.ctx, ctx)
  })
})
