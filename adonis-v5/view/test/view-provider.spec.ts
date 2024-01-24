/*
 * @adonisjs/view
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { Edge } from 'edge.js'

import { setup, fs, APP_KEY } from '../test-helpers'

test.group('View Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('register view provider', async ({ assert }) => {
    const app = await setup('web')

    assert.instanceOf(app.container.use('Adonis/Core/View'), Edge)
    assert.equal(
      app.container.use('Adonis/Core/View').loader.mounted.default,
      join(fs.basePath, 'resources/views')
    )
  })

  test('register config and env globals', async ({ assert }) => {
    const app = await setup('web')
    process.env.NODE_ENV = 'development'

    const output = await app.container
      .use('Adonis/Core/View')
      .renderRaw(`{{ config('app.appKey') }} {{ env('NODE_ENV') }}`)

    assert.equal(output, `${APP_KEY} ${process.env.NODE_ENV}`)
    delete process.env.NODE_ENV
  })

  test('share route and signedRoute methods with view', async ({ assert }) => {
    const app = await setup('web')

    app.container.use('Adonis/Core/Route').get('/', async () => {})
    app.container.use('Adonis/Core/Route').get('/signed', async () => {})
    app.container.use('Adonis/Core/Route').commit()

    const view = app.container.use('Adonis/Core/View')
    view.registerTemplate('dummy', { template: "{{ route('/', {}, 'root') }}" })
    view.registerTemplate('signedDummy', { template: "{{ signedRoute('/signed', {}, 'root') }}" })

    assert.equal(await view.render('dummy'), '/')
    assert.match(await view.render('signedDummy'), /\/signed\?signature=/)
  })

  test('add brisk route macro "render"', async ({ assert }) => {
    const app = await setup('web')
    assert.isFunction(app.container.use('Adonis/Core/Route').on('/').render)
  })

  test('ensure GLOBALS object exists on the View binding', async ({ assert }) => {
    const app = await setup('web')
    assert.isDefined(app.container.use('Adonis/Core/View').GLOBALS)
    assert.property(app.container.use('Adonis/Core/View').GLOBALS, 'route')
  })

  test('register repl binding', async ({ assert }) => {
    const app = await setup('repl')

    assert.property(app.container.use('Adonis/Addons/Repl')['customMethods'], 'loadView')
    assert.isFunction(
      app.container.use('Adonis/Addons/Repl')['customMethods']['loadView']['handler']
    )
  })

  test('register view global for the assets manager', async ({ assert }) => {
    const app = await setup('web')
    assert.property(app.container.use('Adonis/Core/View').GLOBALS, 'asset')
    assert.property(app.container.use('Adonis/Core/View').GLOBALS, 'assetsManager')
    assert.property(app.container.use('Adonis/Core/View').tags, 'entryPointStyles')
    assert.property(app.container.use('Adonis/Core/View').tags, 'entryPointScripts')
  })

  test('do not register repl binding when not in repl environment', async ({ assert }) => {
    const app = await setup('web')
    assert.notProperty(app.container.use('Adonis/Addons/Repl')['customMethods'], 'loadView')
  })

  test('register driveUrl and driveSignedUrl globals', async ({ assert }) => {
    const app = await setup('web', true)

    app.container.use('Adonis/Core/Route').commit()

    const output = await app.container
      .use('Adonis/Core/View')
      .renderRaw(`{{ await driveUrl('foo.txt') }}`)

    assert.equal(output.trim(), '/uploads/foo.txt')
  })
})
