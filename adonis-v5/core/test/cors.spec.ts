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
import supertest from 'supertest'

import { test } from '@japa/runner'

import { Cors } from '../src/Hooks/Cors'
import { fs, setupApp } from '../test-helpers'
import { specFixtures } from './fixtures/cors'

test.group('Cors', (group) => {
  group.each.teardown(async () => {
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')

    await fs.cleanup()
  })

  specFixtures.forEach((fixture) => {
    test(fixture.title, async ({ assert }) => {
      const app = await setupApp()

      const server = createServer(async (req, res) => {
        const cors = new Cors(fixture.configureOptions())
        fixture.configureRequest(req)

        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res)
        await cors.handle(ctx)

        if (!ctx.response.hasLazyBody) {
          ctx.response.send(null)
        }

        ctx.response.finish()
      })

      const res = await supertest(server).get('/')
      fixture.assertNormal(assert, res)

      const resOptions = await supertest(server).options('/')
      fixture.assertOptions(assert, resOptions)
    })
  })
})
