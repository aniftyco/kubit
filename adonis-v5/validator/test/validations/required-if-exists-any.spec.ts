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
import { requiredIfExistsAny } from '../../src/Validations/existence/requiredIfExistsAny'
import { validate } from '../fixtures/rules/index'

function compile(fields: string[]) {
  return requiredIfExistsAny.compile(
    'literal',
    'string',
    rules.requiredIfExistsAny(fields).options,
    {}
  )
}

test.group('Required If Exists Any', () => {
  validate(requiredIfExistsAny, test, undefined, 'foo', compile(['id', 'type']), {
    tip: {
      id: 1,
    },
  })

  test('do not compile when args are not defined', ({ assert }) => {
    const fn = () => requiredIfExistsAny.compile('literal', 'string')
    assert.throws(
      fn,
      '"requiredIfExistsAny": The 3rd argument must be a combined array of arguments'
    )
  })

  test('do not compile when fields are not defined', ({ assert }) => {
    const fn = () => requiredIfExistsAny.compile('literal', 'string', [])
    assert.throws(fn, '"requiredIfExistsAny": expects an array of "fields"')
  })

  test('do not compile when fields are not defined as an array', ({ assert }) => {
    const fn = () => requiredIfExistsAny.compile('literal', 'string', ['foo'])
    assert.throws(fn, '"requiredIfExistsAny": expects "fields" to be an array')
  })

  test('compile with options', ({ assert }) => {
    assert.deepEqual(requiredIfExistsAny.compile('literal', 'string', [['foo']]), {
      name: 'requiredIfExistsAny',
      allowUndefineds: true,
      async: false,
      compiledOptions: { fields: ['foo'] },
    })
  })

  test('report error when expectation matches and field is null', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    requiredIfExistsAny.validate(null, compile(['type', 'user_id']).compiledOptions!, {
      errorReporter: reporter,
      field: 'profile_id',
      pointer: 'profile_id',
      tip: {
        user_id: 1,
      },
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [
        {
          field: 'profile_id',
          rule: 'requiredIfExistsAny',
          message: 'requiredIfExistsAny validation failed',
          args: {
            otherFields: ['type', 'user_id'],
          },
        },
      ],
    })
  })

  test('report error when expectation matches and field is null', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    requiredIfExistsAny.validate(undefined, compile(['type', 'user_id']).compiledOptions!, {
      errorReporter: reporter,
      field: 'profile_id',
      pointer: 'profile_id',
      tip: {
        type: 'twitter',
      },
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [
        {
          field: 'profile_id',
          rule: 'requiredIfExistsAny',
          message: 'requiredIfExistsAny validation failed',
          args: {
            otherFields: ['type', 'user_id'],
          },
        },
      ],
    })
  })

  test('report error when expectation matches and field is empty string', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    requiredIfExistsAny.validate('', compile(['type', 'user_id']).compiledOptions!, {
      errorReporter: reporter,
      field: 'profile_id',
      pointer: 'profile_id',
      tip: {
        type: 'twitter',
      },
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), {
      errors: [
        {
          field: 'profile_id',
          rule: 'requiredIfExistsAny',
          message: 'requiredIfExistsAny validation failed',
          args: {
            otherFields: ['type', 'user_id'],
          },
        },
      ],
    })
  })

  test('work fine when all of the target fields are undefined', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    requiredIfExistsAny.validate('', compile(['type', 'user_id']).compiledOptions!, {
      errorReporter: reporter,
      field: 'profile_id',
      pointer: 'profile_id',
      tip: {},
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), { errors: [] })
  })

  test('work fine when all of target fields are null or undefined', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    requiredIfExistsAny.validate('', compile(['type', 'user_id']).compiledOptions!, {
      errorReporter: reporter,
      field: 'profile_id',
      pointer: 'profile_id',
      tip: {
        user_id: null,
      },
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), { errors: [] })
  })

  test('work fine when expectation matches and field has value', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    requiredIfExistsAny.validate('hello', compile(['type', 'user_id']).compiledOptions!, {
      errorReporter: reporter,
      field: 'profile_id',
      pointer: 'profile_id',
      tip: {
        type: 'twitter',
      },
      root: {},
      refs: {},
      mutate: () => {},
    })

    assert.deepEqual(reporter.toJSON(), { errors: [] })
  })
})
