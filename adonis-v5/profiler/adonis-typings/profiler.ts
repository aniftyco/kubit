/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Profiler' {
  /**
   * Shape of data packet for a single action
   */
  export type ProfilerAction = {
    type: 'action'
    label: string
    timestamp: number
    duration: [number, number]
    data: any
    parent_id?: string
  }

  /**
   * Shape of data packet for a single row
   */
  export type ProfilerRow = {
    id: string
    type: 'row'
    label: string
    timestamp: number
    duration: [number, number]
    data: any
    parent_id?: string
  }

  /**
   * The processor action or worker node that listens for the logs
   */
  export type ProfilerProcessor =
    | string
    | ((log: ProfilerAction | ProfilerRow) => void | Promise<void>)

  /**
   * Profiler action just has one method to mark
   * the action as `done`.
   */
  export interface ProfilerActionContract {
    /**
     * End profiling an action
     */
    end(data?: any): void
  }

  /**
   * Exposes the API to time functions
   */
  export interface AbstractProfilerContract {
    /**
     * Time a function by wrapping it inside the callback
     */
    profile<T extends any>(action: string, data: any, cb: () => T): T

    /**
     * Create a profiler action to time a block of code. Make sure to
     * call `end` on the output of this function
     */
    profile(action: string, data?: any): ProfilerActionContract
    profile<T extends any>(action: string, data?: any, cb?: () => T): ProfilerActionContract | T

    /**
     * Time an async function by wrapping it inside the callback
     */
    profileAsync<T extends any>(action: string, data: any, cb: () => Promise<T>): Promise<T>

    /**
     * Create a profiler action to time a block of code. Make sure to
     * call `end` on the output of this function
     */
    profileAsync(action: string, data?: any): Promise<ProfilerActionContract>
    profileAsync<T extends any>(
      action: string,
      data?: any,
      cb?: () => Promise<T>
    ): Promise<ProfilerActionContract | T>
  }

  /**
   * Profiler row can spawn new actions or new rows
   */
  export interface ProfilerRowContract extends AbstractProfilerContract {
    hasParent: boolean

    /**
     * Create a children row
     */
    create(label: string, data?: any): ProfilerRowContract

    /**
     * End profiling a row
     */
    end(data?: any): void
  }

  /**
   * Main profiler
   */
  export interface ProfilerContract extends AbstractProfilerContract {
    processor?: Exclude<ProfilerProcessor, string>
    isEnabled(labelOrAction: string): boolean

    /**
     * Create a new profiler row
     */
    create(label: string, data?: any): ProfilerRowContract

    /**
     * Define a custom processor function or path to
     * the processor function module.
     */
    process(fn: ProfilerProcessor): void

    /**
     * Flush final bits (if any) and close the worker
     * process
     */
    cleanup(): void
  }

  /**
   * Profiler config
   */
  export type ProfilerConfig = {
    enabled: boolean
    whitelist: string[]
    blacklist: string[]
  }

  const Profiler: ProfilerContract
  export default Profiler
}
