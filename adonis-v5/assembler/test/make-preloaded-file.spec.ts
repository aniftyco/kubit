/*
 * @adonisjs/assembler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readJSONSync } from 'fs-extra'
import { join } from 'path'

import { test } from '@japa/runner'
import { Kernel } from '@kubit/ace'
import { Application } from '@kubit/application'
import { Filesystem } from '@poppinss/dev-utils'

import PreloadFile from '../commands/Make/PreloadFile'
import { toNewlineArray } from '../test-helpers'

const fs = new Filesystem(join(__dirname, '__app'))
const templates = new Filesystem(join(__dirname, '..', 'templates'))

test.group('Make Preloaded File', (group) => {
  group.setup(() => {
    process.env.ADONIS_ACE_CWD = fs.basePath
  })

  group.teardown(() => {
    delete process.env.ADONIS_ACE_CWD
  })

  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('make a preload file inside the start directory', async ({ assert }) => {
    await fs.add('.adonisrc.json', JSON.stringify({}))

    const rcContents = readJSONSync(join(fs.basePath, '.adonisrc.json'))
    const app = new Application(fs.basePath, 'test', rcContents)

    const preloadFile = new PreloadFile(app, new Kernel(app).mockConsoleOutput())
    preloadFile.name = 'viewGlobals'
    preloadFile.environment = ['console', 'web']
    await preloadFile.run()

    const viewGlobals = await fs.get('start/viewGlobals.ts')
    const preloadTemplate = await templates.get('preload-file.txt')
    assert.deepEqual(toNewlineArray(viewGlobals), toNewlineArray(preloadTemplate))

    const rcRawContents = await fs.get('.adonisrc.json')
    assert.deepEqual(JSON.parse(rcRawContents), {
      preloads: [
        {
          file: './start/viewGlobals',
          environment: ['console', 'web'],
        },
      ],
    })
  })

  test('make a preload file inside custom directory', async ({ assert }) => {
    await fs.add(
      '.adonisrc.json',
      JSON.stringify({
        directories: {
          start: 'foo',
        },
      })
    )

    const rcContents = readJSONSync(join(fs.basePath, '.adonisrc.json'))
    const app = new Application(fs.basePath, 'test', rcContents)

    const preloadFile = new PreloadFile(app, new Kernel(app).mockConsoleOutput())
    preloadFile.name = 'viewGlobals'
    preloadFile.environment = ['console', 'web']
    await preloadFile.run()

    const viewGlobals = await fs.get('foo/viewGlobals.ts')
    const preloadTemplate = await templates.get('preload-file.txt')
    assert.deepEqual(toNewlineArray(viewGlobals), toNewlineArray(preloadTemplate))

    const rcRawContents = await fs.get('.adonisrc.json')
    assert.deepEqual(JSON.parse(rcRawContents), {
      directories: { start: 'foo' },
      preloads: [
        {
          file: './foo/viewGlobals',
          environment: ['console', 'web'],
        },
      ],
    })
  })

  test('set preload file environment as repl', async ({ assert }) => {
    await fs.add('.adonisrc.json', JSON.stringify({}))

    const rcContents = readJSONSync(join(fs.basePath, '.adonisrc.json'))
    const app = new Application(fs.basePath, 'test', rcContents)

    const preloadFile = new PreloadFile(app, new Kernel(app).mockConsoleOutput())
    preloadFile.name = 'repl'
    preloadFile.environment = ['repl']
    await preloadFile.run()

    const replFile = await fs.get('start/repl.ts')
    const preloadTemplate = await templates.get('preload-file.txt')
    assert.deepEqual(toNewlineArray(replFile), toNewlineArray(preloadTemplate))

    const rcRawContents = await fs.get('.adonisrc.json')
    assert.deepEqual(JSON.parse(rcRawContents), {
      preloads: [
        {
          file: './start/repl',
          environment: ['repl'],
        },
      ],
    })
  })

  test('prompt for environment when not explicitly defined', async ({ assert }) => {
    await fs.add('.adonisrc.json', JSON.stringify({}))

    const rcContents = readJSONSync(join(fs.basePath, '.adonisrc.json'))
    const app = new Application(fs.basePath, 'test', rcContents)

    const preloadFile = new PreloadFile(app, new Kernel(app).mockConsoleOutput())
    preloadFile.prompt.on('prompt', (question) => {
      question.select(2)
    })

    preloadFile.name = 'repl'
    await preloadFile.exec()

    const replFile = await fs.get('start/repl.ts')
    const preloadTemplate = await templates.get('preload-file.txt')
    assert.deepEqual(toNewlineArray(replFile), toNewlineArray(preloadTemplate))

    const rcRawContents = await fs.get('.adonisrc.json')
    assert.deepEqual(JSON.parse(rcRawContents), {
      preloads: [
        {
          file: './start/repl',
          environment: ['repl'],
        },
      ],
    })
  })

  test('do not set environment when all is selected', async ({ assert }) => {
    await fs.add('.adonisrc.json', JSON.stringify({}))

    const rcContents = readJSONSync(join(fs.basePath, '.adonisrc.json'))
    const app = new Application(fs.basePath, 'test', rcContents)

    const preloadFile = new PreloadFile(app, new Kernel(app).mockConsoleOutput())
    preloadFile.prompt.on('prompt', (question) => {
      question.select(0)
    })

    preloadFile.name = 'events'
    await preloadFile.exec()

    const replFile = await fs.get('start/events.ts')
    const preloadTemplate = await templates.get('preload-file.txt')
    assert.deepEqual(toNewlineArray(replFile), toNewlineArray(preloadTemplate))

    const rcRawContents = await fs.get('.adonisrc.json')
    assert.deepEqual(JSON.parse(rcRawContents), {
      preloads: ['./start/events'],
    })
  })
})
