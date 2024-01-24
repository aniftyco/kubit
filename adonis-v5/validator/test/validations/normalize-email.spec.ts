/*
 * @kubit/validator
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EmailNormalizationOptions } from '@ioc:Adonis/Core/Validator'
import { test } from '@japa/runner'

import { ApiErrorReporter } from '../../src/ErrorReporter'
import { MessagesBag } from '../../src/MessagesBag'
import { rules } from '../../src/Rules'
import { normalizeEmail } from '../../src/Validations/string/normalizeEmail'

function compile(options: EmailNormalizationOptions) {
  return normalizeEmail.compile('literal', 'string', rules.normalizeEmail(options).options, {})
}

test.group('Email | normalizeEmail', () => {
  test('convert email to all lowercase', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    let emailValue = 'FOO@bar.com'

    normalizeEmail.validate(emailValue, compile({ allLowercase: true }).compiledOptions, {
      errorReporter: reporter,
      field: 'email',
      pointer: 'email',
      tip: {},
      root: {},
      refs: {},
      mutate: (newValue) => (emailValue = newValue),
    })

    assert.equal(emailValue, 'foo@bar.com')
  })

  test('keep dots in gmail address', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    let emailValue = 'FOO.bar+2@gmail.com'

    normalizeEmail.validate(emailValue, compile({ gmailRemoveDots: false }).compiledOptions, {
      errorReporter: reporter,
      field: 'email',
      pointer: 'email',
      tip: {},
      root: {},
      refs: {},
      mutate: (newValue) => (emailValue = newValue),
    })

    assert.equal(emailValue, 'foo.bar@gmail.com')
  })

  test('keep subaddress in gmail address', ({ assert }) => {
    const reporter = new ApiErrorReporter(new MessagesBag({}), false)
    let emailValue = 'FOO.bar+2@gmail.com'

    normalizeEmail.validate(emailValue, compile({ gmailRemoveSubaddress: false }).compiledOptions, {
      errorReporter: reporter,
      field: 'email',
      pointer: 'email',
      tip: {},
      root: {},
      refs: {},
      mutate: (newValue) => (emailValue = newValue),
    })

    assert.equal(emailValue, 'foobar+2@gmail.com')
  })
})
