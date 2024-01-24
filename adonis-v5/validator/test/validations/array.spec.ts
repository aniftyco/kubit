/*
 * @adonisjs/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { rules } from '../../src/Rules'
import { validate } from '../fixtures/rules/index'
import { MessagesBag } from '../../src/MessagesBag'
import { ApiErrorReporter } from '../../src/ErrorReporter'
import { array } from '../../src/Validations/primitives/array'

function compile() {
  return array.compile('array', 'array', rules['array']().options, {})
}

test.group('array', () => {
  validate(array, test, null, [], compile())

  test('report error when value is not a valid array', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    array.validate(null, compile().compiledOptions, {
      errorReporter: reporter,
      field: 'addresses',
      pointer: 'addresses',
      tip: {},
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [
        {
          field: 'addresses',
          rule: 'array',
          message: 'array validation failed',
        },
      ],
    })
  })

  test('work fine when value is a valid array', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    array.validate([], compile().compiledOptions, {
      errorReporter: reporter,
      field: 'addresses',
      pointer: 'terms',
      tip: {},
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [],
    })
  })
})
