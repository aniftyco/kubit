/*
 * @kubit/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { ApiErrorReporter, VanillaErrorReporter } from '../src/ErrorReporter'
import { rules } from '../src/Rules'
import { schema } from '../src/Schema'
import { ValidationException } from '../src/ValidationException'
import { validator } from '../src/Validator'
import { fs, setupApp } from '../test-helpers'

test.group('Validation Provider', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()

    /**
     * reset config
     */
    validator.configure({
      bail: false,
      existsStrict: false,
      reporter: VanillaErrorReporter,
    })
  })

  test('register validation provider', async ({ assert }) => {
    const app = await setupApp(['../../providers/ValidatorProvider'])
    assert.deepEqual(app.container.use('Kubit/Validator'), {
      validator,
      schema,
      rules,
      ValidationException,
    })
    assert.isUndefined(app.container.use('Kubit/Validator').validator.config.reporter)
  })

  test('export validation exception class', async ({ assert }) => {
    const app = await setupApp(['../../providers/ValidatorProvider'], 'api')
    assert.deepEqual(app.container.use('Kubit/Validator').ValidationException, ValidationException)
  })

  test('resolve reporter before passing it to the validator', async ({ assert }) => {
    const app = await setupApp(['../../providers/ValidatorProvider'], 'api')
    assert.deepEqual(
      app.container.use('Kubit/Validator').validator.config.reporter,
      ApiErrorReporter
    )
  })

  test('extend request class by adding the validate method', async ({ assert }) => {
    const app = await setupApp(['../../providers/ValidatorProvider'])
    assert.property(app.container.use('Kubit/Request').prototype, 'validate')
  })
})
