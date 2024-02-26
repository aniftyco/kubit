/*
 * @kubit/shield
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import helmetCsp, { ContentSecurityPolicyOptions } from 'helmet-csp';

import { HttpContextContract } from '@ioc:Kubit/HttpContext';
import { CspOptions } from '@ioc:Kubit/Shield';

import { noop } from './noop';

type ValueOf<T> = T[keyof T]

/**
 * Directives to inspect for the `@nonce` keyword
 */
const nonceDirectives = ['defaultSrc', 'scriptSrc', 'styleSrc']

/**
 * Reads `nonce` from the ServerResponse and returns appropriate
 * string
 */
function nonceFn(_: any, response: HttpContextContract['response']['response']) {
  return `'nonce-${response['nonce']}'`
}

/**
 * Transform `@nonce` keywords for a given directive
 */
function transformNonceKeywords(
  directive: ValueOf<Exclude<ContentSecurityPolicyOptions['directives'], undefined>>
): ValueOf<Exclude<ContentSecurityPolicyOptions['directives'], undefined>> {
  /**
   * Transform array values. There should be only one `@nonce` keyword
   */
  if (Array.isArray(directive)) {
    const nonceIndex = directive.indexOf('@nonce')
    if (nonceIndex > -1) {
      directive[nonceIndex] = nonceFn
    }
  }

  return directive
}

/**
 * Factory that returns a function to set the `Content-Security-Policy` header based upon
 * the user config
 */
export function cspFactory(options: CspOptions) {
  if (!options.enabled) {
    return noop
  }

  if (options.directives) {
    /**
     * Transform directives that may contain the
     * "@nonce" directive.
     */
    nonceDirectives.forEach((directive) => {
      if (options.directives![directive]) {
        options.directives![directive] = transformNonceKeywords(options.directives![directive])
      }
    })
  }

  const helmetCspMiddleware = helmetCsp(options)

  return function csp({ response, view }: HttpContextContract) {
    /**
     * Helmet csp needs the `nonce` property on the HTTP ServerResponse
     */
    response.response['nonce'] = response.nonce
    view.share({ cspNonce: response.nonce })
    helmetCspMiddleware(response.request, response.response, () => {})
  }
}
