/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/profiler.ts" />

import { Exception } from '@poppinss/utils'
import { ProfilerAction as ProfilerActionData, ProfilerProcessor } from '@ioc:Adonis/Core/Profiler'

/**
 * Profiler action is used to time the function. A connection can be
 * connected to a row or can be a global action.
 */
export class ProfilerAction {
  private start = process.hrtime()
  private timestamp = Date.now()
  private ended = false

  constructor(
    private label: string,
    private processor: Exclude<ProfilerProcessor, string>,
    private parentId?: string,
    private data?: any
  ) {}

  /**
   * Make packet for the action
   */
  private makePacket(): ProfilerActionData {
    return {
      parent_id: this.parentId,
      type: 'action',
      label: this.label,
      timestamp: this.timestamp,
      duration: process.hrtime(this.start),
      data: this.data || {},
    }
  }

  /**
   * End profiling action.
   */
  public end(data?: any) {
    /**
     * Raise error when end is called twice. Their are high probabilities of
     * end getting called twice
     */
    if (this.ended) {
      throw new Exception('attempt to end profiler action twice')
    }

    /**
     * Set the flag
     */
    this.ended = true

    /**
     * Merge inline data if defined
     */
    if (data) {
      this.data = Object.assign({}, this.data, data)
    }

    this.processor(this.makePacket())
  }
}
