/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.comharminder@cav.ai>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { getCachePathForFile } from '../src/utils'

test.group('getCachePathForFile', () => {
  test('get cache root name for a given file', ({ assert }) => {
    const cwd = join(__dirname, 'app')
    const fileName = join(cwd, 'server.ts')

    const cacheRoot = getCachePathForFile(cwd, fileName)
    assert.equal(cacheRoot, 'server')
  })

  test('get cache root name for a nested path', ({ assert }) => {
    const cwd = join(__dirname, 'app')
    const fileName = join(cwd, 'start/routes.ts')

    const cacheRoot = getCachePathForFile(cwd, fileName)
    assert.equal(cacheRoot, 'start-routes')
  })

  test('get cache root name for deep nested path', ({ assert }) => {
    const cwd = join(__dirname, 'app')
    const fileName = join(cwd, 'app/Controllers/Http/HomeController.ts')

    const cacheRoot = getCachePathForFile(cwd, fileName)
    assert.equal(cacheRoot, 'app-Controllers-Http-HomeController')
  })

  test('handle files without extension', ({ assert }) => {
    const cwd = join(__dirname, 'app')
    const fileName = join(cwd, 'app/Controllers/Http/HomeController')

    const cacheRoot = getCachePathForFile(cwd, fileName)
    assert.equal(cacheRoot, 'app-Controllers-Http-HomeController')
  })
})
