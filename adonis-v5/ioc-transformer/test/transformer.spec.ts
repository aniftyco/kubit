/*
 * @adonisjs/ioc-transformer
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import ts from 'typescript'
import { iocTransformer } from '../src/transformer'

test.group('Transformer', () => {
  test('transform @ioc imports to container use method', async (assert) => {
    const contents = `
      import Foo from '@ioc:Adonis/Foo'
      Foo.bar()
    `

    const output = ts.transpileModule(contents, {
      transformers: {
        after: [iocTransformer(ts, { aliases: {} })],
      },
      compilerOptions: {
        module: 1,
        target: 7,
        moduleResolution: 2,
      },
    })

    assert.deepEqual(output.outputText.split('\n'), [
      '"use strict";',
      'Object.defineProperty(exports, "__esModule", { value: true });',
      `const Foo_1 = global[Symbol.for('ioc.use')](\"Adonis/Foo\");`,
      'Foo_1.default.bar();',
      '',
    ])
  })

  test('transform aliases imports to container use method', async (assert) => {
    const contents = `
      import Foo from 'App/Foo'
      Foo.bar()
    `

    const output = ts.transpileModule(contents, {
      transformers: {
        after: [
          iocTransformer(ts, {
            aliases: {
              App: './app',
            },
          }),
        ],
      },
      compilerOptions: {
        module: 1,
        target: 7,
        moduleResolution: 2,
      },
    })

    assert.deepEqual(output.outputText.split('\n'), [
      '"use strict";',
      'Object.defineProperty(exports, "__esModule", { value: true });',
      `const Foo_1 = global[Symbol.for('ioc.use')](\"App/Foo\");`,
      'Foo_1.default.bar();',
      '',
    ])
  })

  test('transform dynamic aliases imports', async (assert) => {
    const contents = `
      const Foo = await import('App/Foo')
      Foo.bar()
    `

    const output = ts.transpileModule(contents, {
      transformers: {
        after: [
          iocTransformer(ts, {
            aliases: {
              App: './app',
            },
          }),
        ],
      },
      compilerOptions: {
        module: 1,
        target: 7,
        moduleResolution: 2,
      },
    })

    assert.deepEqual(output.outputText.split('\n'), [
      `const Foo = await Promise.resolve().then(() => global[Symbol.for('ioc.use')]('App/Foo'));`,
      'Foo.bar();',
      '',
    ])
  })

  test('transform dynamic aliases imports with runtime variables', async (assert) => {
    const contents = `
      import modelName from './runtimeModel'
      const Foo = await import(\`App/\${modelName}\`)
      Foo.bar()
    `

    const output = ts.transpileModule(contents, {
      transformers: {
        after: [
          iocTransformer(ts, {
            aliases: {
              App: './app',
            },
          }),
        ],
      },
      compilerOptions: {
        module: 1,
        target: 7,
        moduleResolution: 2,
      },
    })

    assert.deepEqual(output.outputText.split('\n'), [
      '"use strict";',
      'Object.defineProperty(exports, "__esModule", { value: true });',
      `const runtimeModel_1 = require(\"./runtimeModel\");`,
      `const Foo = await Promise.resolve().then(() => global[Symbol.for('ioc.use')](\`App/\${runtimeModel_1.default}\`));`,
      'Foo.bar();',
      '',
    ])
  })

  test('transform dynamic aliases imports with runtime variables using binary expression', async (assert) => {
    const contents = `
      import modelName from './runtimeModel'
      const Foo = await import('App/' + modelName)
      Foo.bar()
    `

    const output = ts.transpileModule(contents, {
      transformers: {
        after: [
          iocTransformer(ts, {
            aliases: {
              App: './app',
            },
          }),
        ],
      },
      compilerOptions: {
        module: 1,
        target: 7,
        moduleResolution: 2,
      },
    })

    assert.deepEqual(output.outputText.split('\n'), [
      '"use strict";',
      'Object.defineProperty(exports, "__esModule", { value: true });',
      `const runtimeModel_1 = require(\"./runtimeModel\");`,
      `const Foo = await Promise.resolve().then(() => global[Symbol.for('ioc.use')]('App/' + runtimeModel_1.default));`,
      'Foo.bar();',
      '',
    ])
  })

  test('disallow dynamic @ioc imports with runtime variables', async (assert) => {
    const contents = `
      import modelName from './runtimeModel'
      const Foo = await import('@ioc:App/' + modelName)
      Foo.bar()
    `

    const output = () =>
      ts.transpileModule(contents, {
        transformers: {
          after: [
            iocTransformer(ts, {
              aliases: {
                App: './app',
              },
            }),
          ],
        },
        compilerOptions: {
          module: 1,
          target: 7,
          moduleResolution: 2,
        },
      })

    assert.throw(output, 'Imports prefixed with "@ioc:" cannot use runtime values')
  })
})
