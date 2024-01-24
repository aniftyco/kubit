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
import ts from 'typescript'
import revisionHash from 'rev-hash'
import { Filesystem } from '@poppinss/dev-utils'

import { Config } from '../src/Config'

const fs = new Filesystem(join(__dirname, 'app'))

test.group('Config', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('parse tsconfig and return compiler options back', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    const config = new Config(cwd, cacheRoot, ts)
    const options = config.parse()

    assert.isNull(options.error)
    assert.equal(options.version, Config.version)
    assert.property(options.options?.compilerOptions, 'esModuleInterop')
    assert.property(options.options?.compilerOptions, 'configFilePath')
  })

  test('write compiled file to cache', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    const config = new Config(cwd, cacheRoot, ts)
    const options = config.parse()

    const hasCacheFile = await fs.exists(`cache/tsconfig/${revisionHash(contents)}.json`)
    assert.isTrue(hasCacheFile)

    assert.isNull(options.error)
    assert.equal(options.version, Config.version)
    assert.property(options.options?.compilerOptions, 'esModuleInterop')
    assert.property(options.options?.compilerOptions, 'configFilePath')
  })

  test('do not write to cache when caching is disabled', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    const config = new Config(cwd, cacheRoot, ts, false)
    const options = config.parse()

    const hasCacheFile = await fs.exists(`cache/tsconfig/${revisionHash(contents)}.json`)
    assert.isFalse(hasCacheFile)

    assert.isNull(options.error)
    assert.equal(options.version, Config.version)
    assert.property(options.options?.compilerOptions, 'esModuleInterop')
    assert.property(options.options?.compilerOptions, 'configFilePath')
  })

  test('return error when tsconfig file is missing', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')

    const config = new Config(cwd, cacheRoot, ts)
    const options = () => config.parse()
    assert.throws(
      options,
      '"@adonisjs/require-ts" expects the "tsconfig.json" file to exists in the app root'
    )
  })

  test('return error when tsconfig file is invalid', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: './node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    const config = new Config(cwd, cacheRoot, ts)
    const options = config.parse()

    const hasCacheFile = await fs.exists(`cache/tsconfig/${revisionHash(contents)}.json`)
    assert.isFalse(hasCacheFile)

    assert.exists(options.error)
    assert.isNull(options.options)
    assert.equal(
      options.error![0].messageText,
      `File './node_modules/@adonisjs/mrm-preset/_tsconfig' not found.`
    )
  })

  test('read from cache when exists', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    /**
     * Creating cache file
     */
    await fs.add(
      `cache/tsconfig/${revisionHash(contents)}.json`,
      JSON.stringify({
        version: Config.version,
        options: {
          compilerOptions: {
            dummyValue: true,
          },
        },
      })
    )

    const config = new Config(cwd, cacheRoot, ts)
    const options = config.parse()
    assert.isNull(options.error)
    assert.deepEqual(options.options, {
      compilerOptions: { dummyValue: true },
      transformers: undefined,
    })
  })

  test('do not read from cache when caching is disabled', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    /**
     * Creating cache file
     */
    await fs.add(
      `cache/tsconfig/${revisionHash(contents)}.json`,
      JSON.stringify({
        version: Config.version,
        options: {
          compilerOptions: {
            dummyValue: true,
          },
        },
      })
    )

    const config = new Config(cwd, cacheRoot, ts, false)
    const options = config.parse()
    assert.isNull(options.error)
    assert.notProperty(options.options?.compilerOptions, 'dummyValue')
  })

  test('do not read from cache during version mis-match', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add('tsconfig.json', contents)

    /**
     * Creating cache file
     */
    await fs.add(
      `cache/tsconfig/${revisionHash(contents)}.json`,
      JSON.stringify({
        version: 'v0.0',
        options: {
          compilerOptions: {
            dummyValue: true,
          },
        },
      })
    )

    const config = new Config(cwd, cacheRoot, ts)
    const options = config.parse()
    assert.isNull(options.error)
    assert.notProperty(options.options?.compilerOptions, 'dummyValue')
  })

  test('do not read from cache during when file contents has changed', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = JSON.stringify({
      extends: './node_modules/@adonisjs/mrm-preset/_tsconfig',
    })

    await fs.add(
      'tsconfig.json',
      JSON.stringify({
        extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
      })
    )

    /**
     * Creating cache file
     */
    await fs.add(
      `cache/tsconfig/${revisionHash(contents)}.json`,
      JSON.stringify({
        version: Config.version,
        options: {
          compilerOptions: {
            dummyValue: true,
          },
        },
      })
    )

    const config = new Config(cwd, cacheRoot, ts)
    const options = config.parse()
    assert.isNull(options.error)
    assert.notProperty(options.options?.compilerOptions, 'dummyValue')
  })

  test('fetch transformers from the raw config file', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')

    await fs.add(
      'tsconfig.json',
      JSON.stringify({
        extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
        transformers: {
          after: [{ transform: '@adonisjs/ioc-transformer' }],
        },
      })
    )

    const config = new Config(cwd, cacheRoot, ts)
    const { error, options } = config.parse()

    assert.isNull(error)
    assert.deepEqual(options?.transformers, {
      after: [{ transform: '@adonisjs/ioc-transformer' }],
      before: undefined,
      afterDeclarations: undefined,
    })
  })

  test('cache transformers', async ({ assert }) => {
    const cwd = fs.basePath
    const cacheRoot = join(fs.basePath, 'cache')

    const contents = JSON.stringify({
      extends: '../../node_modules/@adonisjs/mrm-preset/_tsconfig',
      transformers: {
        after: [{ transform: '@adonisjs/ioc-transformer' }],
      },
    })
    await fs.add('tsconfig.json', contents)

    const config = new Config(cwd, cacheRoot, ts)
    config.parse()

    const cacheContents = await fs.get(`cache/tsconfig/${revisionHash(contents)}.json`)
    assert.deepEqual(JSON.parse(cacheContents).options.transformers, {
      after: [{ transform: '@adonisjs/ioc-transformer' }],
    })
  })
})
