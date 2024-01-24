/*
 * @adonisjs/require-ts
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import revHash from 'rev-hash'
import { Filesystem } from '@poppinss/dev-utils'

import { Cache } from '../src/Cache'

const fs = new Filesystem(join(__dirname, 'app'))

test.group('Cache', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('make path to the cache file', ({ assert }) => {
    const cwd = join(__dirname, '..')
    const fileName = join(cwd, 'server.ts')
    const cache = new Cache(cwd, fs.basePath)

    const fileCachePath = cache.makeCachePath(fileName, 'hello-world', '.js')
    assert.equal(fileCachePath, join(fs.basePath, 'server', `${revHash('hello-world')}.js`))
  })

  test('get file contents from the cache', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const fileName = join(cwd, 'server.ts')
    const cache = new Cache(cwd, fs.basePath)
    const cachedFileName = `${revHash('hello-world')}.js`

    await fs.add(`server/${cachedFileName}`, 'hello-world')

    const fileCachePath = cache.makeCachePath(fileName, 'hello-world', '.js')
    assert.equal(cache.get(fileCachePath), 'hello-world')
  })

  test("return null when cache file doesn't exists", async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const fileName = join(cwd, 'server.ts')
    const cache = new Cache(cwd, fs.basePath)

    const fileCachePath = cache.makeCachePath(fileName, 'hello-world', '.js')
    assert.isNull(cache.get(fileCachePath))
  })

  test('write cache files', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const fileName = join(cwd, 'server.ts')
    const cache = new Cache(cwd, fs.basePath)

    cache.set(cache.makeCachePath(fileName, 'hello-world', '.js'), 'hello-world')
    cache.set(cache.makeCachePath(fileName, 'hi-world', '.js'), 'hi-world')
    cache.set(cache.makeCachePath(fileName, 'hey-world', '.js'), 'hey-world')

    assert.isTrue(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hello-world')}.js`))
    )
    assert.isTrue(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hi-world')}.js`))
    )
    assert.isTrue(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hey-world')}.js`))
    )

    cache.clearForFile(fileName)

    assert.isFalse(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hello-world')}.js`))
    )
    assert.isFalse(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hi-world')}.js`))
    )
    assert.isFalse(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hey-world')}.js`))
    )
  })

  test('write all cache files', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const fileName = join(cwd, 'server.ts')
    const cache = new Cache(cwd, fs.basePath)

    cache.set(cache.makeCachePath(fileName, 'hello-world', '.js'), 'hello-world')
    cache.set(cache.makeCachePath(fileName, 'hi-world', '.js'), 'hi-world')
    cache.set(cache.makeCachePath(fileName, 'hey-world', '.js'), 'hey-world')

    assert.isTrue(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hello-world')}.js`))
    )
    assert.isTrue(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hi-world')}.js`))
    )
    assert.isTrue(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hey-world')}.js`))
    )

    cache.clearAll()

    assert.isFalse(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hello-world')}.js`))
    )
    assert.isFalse(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hi-world')}.js`))
    )
    assert.isFalse(
      await fs.fsExtra.pathExists(join(fs.basePath, 'server', `${revHash('hey-world')}.js`))
    )
  })
})
