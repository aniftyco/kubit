/*
 * @adonisjs/events
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FakeEmitterContract } from '@ioc:Adonis/Core/Event'

/**
 * Fake emitter to be used for finding and asserting
 * faked events
 */
export class FakeEmitter implements FakeEmitterContract {
  public events: { name: string; data: any }[] = []

  /**
   * Get all the emitted events
   */
  public all() {
    return this.events
  }

  /**
   * Returns the size of captured events
   */
  public size() {
    return this.events.length
  }

  /**
   * Find if the event has emitted
   */
  public exists(
    eventOrCallback: string | ((event: { name: string; data: any }) => boolean)
  ): boolean {
    return !!this.find(eventOrCallback)
  }

  /**
   * Get selected events
   */
  public filter(
    eventOrCallback: string | ((event: { name: string; data: any }) => boolean)
  ): any[] {
    if (typeof eventOrCallback === 'function') {
      return this.events.filter(eventOrCallback)
    }

    return this.events.filter((event) => event.name === eventOrCallback)
  }

  /**
   * Find a specific event
   */
  public find(eventOrCallback: string | ((event: { name: string; data: any }) => boolean)): any {
    if (typeof eventOrCallback === 'function') {
      return this.events.find(eventOrCallback)
    }

    return this.events.find((event) => event.name === eventOrCallback)
  }

  public restore() {
    this.events = []
  }
}
