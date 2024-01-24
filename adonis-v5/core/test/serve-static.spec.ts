/*
 * @kubit/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import { createServer } from 'http'
import { join } from 'path'
import supertest from 'supertest'

import { test } from '@japa/runner'

import { ServeStatic } from '../src/Hooks/Static'
import { fs, setupApp } from '../test-helpers'

test.group('Serve Static', (group) => {
  group.each.teardown(async () => {
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')

    await fs.cleanup()
  })

  test('serve static file when it exists', async ({ assert }) => {
    await fs.add('public/style.css', 'body { background: #000 }')
    const app = await setupApp()

    const server = createServer(async (req, res) => {
      const serveStatic = new ServeStatic(join(fs.basePath, 'public'), {
        enabled: true,
      })
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res)
      await serveStatic.handle(ctx)

      assert.equal(ctx.response.response.listenerCount('finish'), 1)
      assert.isTrue(ctx.response.finished)
    })

    const { text } = await supertest(server).get('/style.css')
    assert.equal(text, 'body { background: #000 }')
  })

  test('flush headers set before the static files hook', async ({ assert }) => {
    await fs.add('public/style.css', 'body { background: #000 }')
    const app = await setupApp()

    const server = createServer(async (req, res) => {
      const serveStatic = new ServeStatic(join(fs.basePath, 'public'), {
        enabled: true,
      })
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res)
      ctx.response.header('x-powered-by', 'adonis')
      await serveStatic.handle(ctx)

      /**
       * Showcasing that headers has already been flushed
       */
      ctx.response.removeHeader('x-powered-by')

      assert.equal(ctx.response.response.listenerCount('finish'), 1)
      assert.isTrue(ctx.response.finished)
    })

    const { text, headers } = await supertest(server).get('/style.css')
    assert.property(headers, 'x-powered-by')
    assert.equal(headers['x-powered-by'], 'adonis')
    assert.equal(text, 'body { background: #000 }')
  })

  test('do not flush headers when response is a 404', async ({ assert }) => {
    const app = await setupApp()

    const server = createServer(async (req, res) => {
      const serveStatic = new ServeStatic(join(fs.basePath, 'public'), {
        enabled: true,
      })

      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res)
      ctx.response.header('x-powered-by', 'adonis')
      await serveStatic.handle(ctx)

      ctx.response.removeHeader('x-powered-by')
      ctx.response.finish()
      assert.equal(ctx.response.response.listenerCount('finish'), 1)
      assert.isTrue(ctx.response.finished)
    })

    const { headers } = await supertest(server).get('/style.css')
    assert.notProperty(headers, 'x-powered-by')
  })

  test('pass through when unable to lookup file', async ({ assert }) => {
    await fs.add('public/style.css', 'body { background: #000 }')
    const app = await setupApp()

    const server = createServer(async (req, res) => {
      const serveStatic = new ServeStatic(join(fs.basePath, 'public'), {
        enabled: true,
      })
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res)
      await serveStatic.handle(ctx)

      assert.equal(ctx.response.response.listenerCount('finish'), 1)
      assert.isFalse(ctx.response.finished)

      ctx.response.status(404).send('404')
      ctx.response.finish()
    })

    await supertest(server).get('/').expect(404)
  })

  test('allow user defined headers', async ({ assert }) => {
    await fs.add('public/style.css', 'body { background: #000 }')
    const app = await setupApp()

    const server = createServer(async (req, res) => {
      const serveStatic = new ServeStatic(join(fs.basePath, 'public'), {
        enabled: true,
        headers(path) {
          return {
            'X-Custom-Path': path,
          }
        },
      })
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res)
      ctx.response.header('x-powered-by', 'adonis')
      await serveStatic.handle(ctx)

      /**
       * Showcasing that headers has already been flushed
       */
      ctx.response.removeHeader('x-powered-by')

      assert.equal(ctx.response.response.listenerCount('finish'), 1)
      assert.isTrue(ctx.response.finished)
    })

    const { text, headers } = await supertest(server).get('/style.css')
    assert.property(headers, 'x-powered-by')
    assert.property(headers, 'x-custom-path')
    assert.equal(headers['x-powered-by'], 'adonis')
    assert.equal(headers['x-custom-path'], join(fs.basePath, 'public', 'style.css'))
    assert.equal(text, 'body { background: #000 }')
  })
})
