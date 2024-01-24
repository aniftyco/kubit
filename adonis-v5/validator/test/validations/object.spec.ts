/*
 * @kubit/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { ApiErrorReporter } from '../../src/ErrorReporter'
import { MessagesBag } from '../../src/MessagesBag'
import { rules } from '../../src/Rules'
import { object } from '../../src/Validations/primitives/object'
import { validate } from '../fixtures/rules/index'

function compile() {
  return object.compile('object', 'object', rules['object']().options, {})
}

test.group('Object', () => {
  validate(object, test, null, {}, compile())

  test('report error when value is null', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    object.validate(null, compile().compiledOptions, {
      errorReporter: reporter,
      field: 'profile',
      pointer: 'profile',
      tip: {},
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [
        {
          field: 'profile',
          rule: 'object',
          message: 'object validation failed',
        },
      ],
    })
  })

  test('report error when value is an array', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    object.validate([], compile().compiledOptions, {
      errorReporter: reporter,
      field: 'profile',
      pointer: 'profile',
      tip: {},
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [
        {
          field: 'profile',
          rule: 'object',
          message: 'object validation failed',
        },
      ],
    })
  })

  test('work fine when value is a valid object', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    object.validate({}, compile().compiledOptions, {
      errorReporter: reporter,
      field: 'profile',
      pointer: 'profile',
      tip: {},
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), { errors: [] })
  })
})
