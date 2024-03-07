import { defineStaticProperty } from '@poppinss/utils';
import { string } from '@poppinss/utils/build/helpers';

import type { PropOptions, JobPropOptions, JobHandlerContract, QueueJob, QueueContract } from '@ioc:Kubit/Queue';
function StaticImplements<T>() {
  return (_t: T) => {};
}

@StaticImplements<QueueJob>()
export class BaseJob implements JobHandlerContract {
  public static $queue: QueueContract;
  /**
   * Whether or not the job has been booted. Booting the job initializes it's
   * static properties. Base jobs must not be initialized.
   */
  public static booted: boolean;

  /**
   * Props makes it easier to define extra props on the job
   * and distinguish them with the attributes to be sent
   * over to the adapter
   */
  public static $propsDefinitions: Map<string, JobPropOptions> = new Map();

  /**
   * Define a static property on the job using the inherit or
   * define strategy.
   *
   * Inherit strategy will clone the property from the parent job
   * and will set it on the current job
   */
  public static $defineProperty<Job extends QueueJob, Prop extends keyof Job>(
    this: Job,
    propertyName: Prop,
    defaultValue: Job[Prop],
    strategy: 'inherit' | 'define' | ((value: Job[Prop]) => Job[Prop])
  ) {
    defineStaticProperty(this as any, BaseJob, {
      propertyName: propertyName,
      defaultValue: defaultValue,
      strategy: strategy,
    });
  }

  /**
   * Define a new prop on the job. This is required, so that
   * we differentiate between plain properties vs job attributes.
   */
  public static $addProp(name: string, options: Partial<PropOptions>) {
    const descriptor = Object.getOwnPropertyDescriptor(this.prototype, name);

    const prop: JobPropOptions = {
      propName: options.propName || string.snakeCase(name),
      hasGetter: !!(descriptor && descriptor.get),
      hasSetter: !!(descriptor && descriptor.set),
      serialize: options.serialize,
      prepare: options.prepare,
      consume: options.consume,
    };

    this.$propsDefinitions.set(name, prop);

    return prop;
  }

  /**
   * Returns a boolean telling if prop exists on the job
   */
  public static $hasProp(name: string): boolean {
    return this.$propsDefinitions.has(name);
  }

  /**
   * Returns the prop for a given name
   */
  public static $getProp(name: string): JobPropOptions | undefined {
    return this.$propsDefinitions.get(name);
  }

  /**
   * Boot the job
   */
  public static boot() {
    /**
     * Define the property when not defined on self
     */
    if (!this.hasOwnProperty('booted')) {
      this.booted = false;
    }

    /**
     * Return when already booted
     */
    if (this.booted === true) {
      return;
    }

    this.booted = true;
  }

  /**
   * Dispatch the job to the queue
   */
  public static async dispatch(payload: any) {
    await this.$queue.dispatch(this.name, payload);
  }

  public async handle() {
    throw new Error('Method not implemented.');
  }
}
