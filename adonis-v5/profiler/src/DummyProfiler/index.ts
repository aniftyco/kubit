/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/profiler.ts" />

import { ProfilerRowContract, ProfilerActionContract } from '@ioc:Adonis/Core/Profiler'

/**
 * Dummy action is a noop implementation of [[ProfileActionContract]]. When
 * actions for certain labels are disabled, then dummy action is used and
 * helps in avoiding the need of unneccessary `if/else` clauses.
 */
class DummyAction implements ProfilerActionContract {
  public end() {}
}

/**
 * Dummy row is a noop implementation of [[ProfilerRowContract]]. When certain
 * labels are disabled, then dummy row is used and helps in avoiding the need
 * of unneccessary `if/else` clauses.
 */
class DummyRow implements ProfilerRowContract {
  private action = new DummyAction()

  public get hasParent() {
    return false
  }

  public profile(action: string, data: any, cb: () => void): void
  public profile(action: string, data?: any): ProfilerActionContract
  public profile(_action: string, _data?: any, cb?: () => void): ProfilerActionContract | void {
    if (typeof cb === 'function') {
      return cb()
    }

    return this.action
  }

  public async profileAsync(action: string, data: any, cb: () => void): Promise<void>
  public async profileAsync(action: string, data?: any): Promise<ProfilerActionContract>
  public async profileAsync(
    _action: string,
    _data?: any,
    cb?: () => void
  ): Promise<ProfilerActionContract | void> {
    if (typeof cb === 'function') {
      return cb()
    }

    return this.action
  }

  public create() {
    return this
  }

  public end() {}
}

const dummyAction = new DummyAction()
const dummyRow = new DummyRow()

export { dummyAction, dummyRow }
