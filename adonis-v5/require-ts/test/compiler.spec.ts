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
import revHash from 'rev-hash'
import { Filesystem } from '@poppinss/dev-utils'

import { Compiler } from '../src/Compiler'
import { stringToArray, inspectConsole } from '../test-helpers'

const fs = new Filesystem(join(__dirname, 'app'))

test.group('Compiler', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('parse typescript source and return back the compiled contents', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')

    const compiler = new Compiler(cwd, cacheRoot, ts, {
      compilerOptions: {},
    })

    const inspect = inspectConsole()
    const output = compiler.compile(
      'server.ts',
      `
      const name: string = 'hello'
      export default name
    `
    )

    const { stdout, stderr } = inspect()

    assert.deepEqual(stdout, [])
    assert.deepEqual(stderr, [])
    assert.deepEqual(
      stringToArray(output).slice(0, -1),
      stringToArray(`"use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var name = 'hello';
      exports.default = name;`)
    )
  })

  test('cache file contents on disk', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = `
      const name: string = 'hello'
      export default name
    `

    const fileHash = revHash(contents)
    const compiler = new Compiler(cwd, cacheRoot, ts, {
      compilerOptions: {},
    })

    const inspect = inspectConsole()
    const output = compiler.compile('server.ts', contents)

    const { stdout, stderr } = inspect()

    assert.deepEqual(stdout, [])
    assert.deepEqual(stderr, [])
    const cachedContents = await fs.get(`cache/server/${fileHash}.js`)
    assert.deepEqual(stringToArray(output), stringToArray(cachedContents))
  })

  test('do not re-compile file when already exists in cache', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = `
      const name: string = 'hello'
      export default name
    `

    const fileHash = revHash(contents)
    await fs.add(`cache/server/${fileHash}.js`, 'hello')

    const compiler = new Compiler(cwd, cacheRoot, ts, {
      compilerOptions: {},
    })

    const inspect = inspectConsole()
    const output = compiler.compile('server.ts', contents)

    const { stdout, stderr } = inspect()

    assert.deepEqual(stdout, [])
    assert.deepEqual(stderr, [])
    assert.deepEqual(stringToArray(output), stringToArray('hello'))
  })

  test('do not cache when caching is disabled', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')
    const contents = `
      const name: string = 'hello'
      export default name
    `

    const fileHash = revHash(contents)
    const compiler = new Compiler(
      cacheRoot,
      cwd,
      ts,
      {
        compilerOptions: {},
      },
      false
    )

    const inspect = inspectConsole()
    const output = compiler.compile('server.ts', contents)

    const { stdout, stderr } = inspect()

    assert.deepEqual(stdout, [])
    assert.deepEqual(stderr, [])

    const hasCacheFile = await fs.exists(`cache/server/${fileHash}.js`)
    assert.isFalse(hasCacheFile)

    assert.deepEqual(
      stringToArray(output).slice(0, -1),
      stringToArray(`"use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var name = 'hello';
      exports.default = name;`)
    )
  })

  test('apply transformers', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')

    await fs.add(
      'transformer.js',
      `
      module.exports = function (ts, appRoot) {
        return (ctx) => {
           return (sourceFile) => {
            function visitor (node) {
              if (
                ts.isCallExpression(node)
                && node.expression
                && ts.isIdentifier(node.expression)
                && node.expression.escapedText === 'require'
              ) {
                const moduleName = node.arguments[0].text
                return ts.factory.createCallExpression(
                  ts.factory.createIdentifier('ioc.use'),
                  undefined,
                  [ts.factory.createStringLiteral(moduleName)],
                )
              }
              return ts.visitEachChild(node, visitor, ctx)
            }
            return ts.visitEachChild(sourceFile, visitor, ctx)
          }
        }
      }
    `
    )

    const compiler = new Compiler(cwd, cacheRoot, ts, {
      compilerOptions: {},
      transformers: {
        after: [{ transform: join(fs.basePath, 'transformer.js') }],
      },
    })

    const inspect = inspectConsole()
    const output = compiler.compile('server.ts', `import'foo'`)

    const { stdout, stderr } = inspect()

    assert.deepEqual(stdout, [])
    assert.deepEqual(stderr, [])

    assert.deepEqual(
      stringToArray(output).slice(0, -1),
      stringToArray(`"use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      ioc.use("foo");`)
    )
  })

  test('complain when rootDir is defined is file is not marked as virtual', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')

    const compiler = new Compiler(cwd, cacheRoot, ts, {
      compilerOptions: {
        rootDir: join(__dirname),
      },
    })

    const inspect = inspectConsole()
    const output = compiler.compile(
      'server.ts',
      `
      const name: string = 'hello'
      export default name
    `,
      false
    )

    const { stdout, stderr } = inspect()

    assert.match(stdout[0], /error TS6059: File 'server\.ts' is not under 'rootDir'/)
    assert.deepEqual(stderr, [])

    assert.deepEqual(
      stringToArray(output).slice(0, -1),
      stringToArray(`"use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var name = 'hello';
      exports.default = name;`)
    )
  })

  test('work fine when rootDir is defined is file is marked as virtual', async ({ assert }) => {
    const cwd = join(__dirname, '..')
    const cacheRoot = join(fs.basePath, 'cache')

    const compiler = new Compiler(cwd, cacheRoot, ts, {
      compilerOptions: {
        rootDir: join(__dirname),
      },
    })

    const inspect = inspectConsole()
    const output = compiler.compile(
      'server.ts',
      `
      const name: string = 'hello'
      export default name
    `,
      true
    )

    const { stdout, stderr } = inspect()

    assert.deepEqual(stdout, [])
    assert.deepEqual(stderr, [])

    assert.deepEqual(
      stringToArray(output).slice(0, -1),
      stringToArray(`"use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var name = 'hello';
      exports.default = name;`)
    )
  })
})
