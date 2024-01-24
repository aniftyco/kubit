/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/profiler.ts" />

import { ProfilerActionContract, AbstractProfilerContract } from '@ioc:Adonis/Core/Profiler'

/**
 * Abstract class to be extended to add support for timing functions.
 */
export abstract class AbstractProfiler implements AbstractProfilerContract {
  protected abstract getAction(action: string, data: any): ProfilerActionContract

  /**
   * Profile asyncronously. If you are are not passing a callback to this method,
   * then consider using [[this.profile]].
   */
  public async profileAsync<T extends any>(
    action: string,
    data: any,
    cb: () => Promise<T>
  ): Promise<T>
  public async profileAsync(action: string, data?: any): Promise<ProfilerActionContract>
  public async profileAsync<T extends any>(
    action: string,
    data?: any,
    cb?: () => Promise<T>
  ): Promise<ProfilerActionContract | T> {
    const profilerAction = this.getAction(action, data)

    if (typeof cb === 'function') {
      try {
        const result = await cb()
        profilerAction.end()
        return result
      } catch (error) {
        profilerAction.end({ error })
        throw error
      }
    }

    return profilerAction
  }

  /**
   * Get a new profiler action instance to time your code. Make sure
   * to call the `end` function, when manually managing the actions
   */
  public profile<T extends any>(action: string, data: any, cb: () => T): T
  public profile(action: string, data?: any): ProfilerActionContract
  public profile<T extends any>(
    action: string,
    data?: any,
    cb?: () => T
  ): ProfilerActionContract | T {
    const profilerAction = this.getAction(action, data)

    if (typeof cb === 'function') {
      try {
        const result = cb()
        profilerAction.end()
        return result
      } catch (error) {
        profilerAction.end({ error })
        throw error
      }
    }

    return profilerAction
  }
}
