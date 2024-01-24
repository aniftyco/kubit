/*
 * @adonisjs/profiler
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/profiler.ts" />

import { Worker } from 'jest-worker'
import { resolveFrom } from '@poppinss/utils/build/helpers'
import { LoggerContract } from '@ioc:Adonis/Core/Logger'

import { ProfilerRow } from '../Row'
import { ProfilerAction } from '../Action'
import { AbstractProfiler } from './AbstractProfiler'
import { dummyRow, dummyAction } from '../DummyProfiler'
import { InvalidProcessorException } from '../Exceptions/InvalidProcessorException'

import {
  ProfilerConfig,
  ProfilerContract,
  ProfilerProcessor,
  ProfilerRowContract,
  ProfilerActionContract,
} from '@ioc:Adonis/Core/Profiler'

/**
 * Profiler exposes the public interface to create new profiling
 * rows and actions. In case of blacklisted actions, dummy
 * implementations are returned, resulting in noop.
 */
export class Profiler extends AbstractProfiler implements ProfilerContract {
  private worker?: Worker

  /**
   * Subscribe to listen for events
   */
  public processor?: Exclude<ProfilerProcessor, string>

  /**
   * Profiler config
   */
  private config: ProfilerConfig

  constructor(
    private appRoot: string,
    private logger: LoggerContract,
    config: Partial<ProfilerConfig>
  ) {
    super()

    this.config = Object.assign(
      {
        enabled: true,
        whitelist: [],
        blacklist: [],
      },
      config
    )
  }

  /**
   * Returns the action to be used for timing functions
   */
  protected getAction(action: string, data?: any): ProfilerActionContract {
    return this.isEnabled(action)
      ? new ProfilerAction(action, this.processor!, undefined, data)
      : dummyAction
  }

  /**
   * Returns a boolean telling if profiler is enabled for
   * a given `action` or `label` or not?
   */
  public isEnabled(labelOrAction: string): boolean {
    if (!this.config.enabled || !this.processor) {
      return false
    }

    /**
     * If white list is empty, then check for blacklist
     */
    if (this.config.whitelist.length === 0) {
      return this.config.blacklist.indexOf(labelOrAction) === -1
    }

    /**
     * Otherwise check for whitelist only. We can check for `whitelist` and
     * `blacklist` both here, but not 100% sure.
     */
    return this.config.whitelist.indexOf(labelOrAction) > -1
  }

  /**
   * Creates a new profiler row for a given action. If action is not enabled
   * then a copy of [[this.dummyRow]] is returned, which has the same
   * public API with all actions to a noop.
   */
  public create(label: string, data?: any): ProfilerRowContract {
    if (this.isEnabled(label)) {
      return new ProfilerRow(label, this, data)
    }

    return dummyRow
  }

  /**
   * Close the worker and cleanup memory
   */
  public cleanup() {
    if (this.worker) {
      this.worker.end()
    }

    this.processor = undefined
    this.worker = undefined
  }

  /**
   * Define subscriber for the profiler. Only one subscriber can be defined
   * at max. Redifying the subscriber will override the existing subscriber
   */
  public process(fn: ProfilerProcessor): void {
    /**
     * The processor is an inline function
     */
    if (typeof fn === 'function') {
      this.processor = async (log) => {
        try {
          await fn(log)
        } catch (error) {
          this.logger.fatal(error, 'The profiler processor function raised an exception')
        }
      }
      return
    }

    this.worker = new Worker(resolveFrom(this.appRoot, fn))
    this.worker.getStdout().pipe(process.stdout)
    this.worker.getStderr().pipe(process.stderr)

    /**
     * Ensure worker has "process" method on it
     */
    if (typeof this.worker!['process'] !== 'function') {
      throw InvalidProcessorException.missingWorkerMethod()
    }

    /**
     * The processor is a spawned worker (recommended)
     */
    this.processor = async (log) => {
      try {
        await this.worker!['process'](log)
      } catch (error) {
        this.logger.fatal(error, `The profiler processor worker "${fn}" raised an exception`)
      }
    }
  }
}
