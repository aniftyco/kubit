declare module '@ioc:Kubit/Queue' {
  export type DecoratorFn = (target: any, property: any) => void;
  export type PropDecorator = (options?: Partial<PropOptions>) => DecoratorFn;

  export interface QueueJob {
    /**
     * Define a static property on the job using the inherit or
     * define strategy.
     *
     * Inherit strategy will clone the property from the parent job
     * and will set it on the current job
     */
    static $defineProperty<Job extends QueueJob, Prop extends keyof Job>(
      this: Job,
      propertyName: Prop,
      defaultValue: Job[Prop],
      strategy: 'inherit' | 'define' | ((value: Job[Prop]) => Job[Prop])
    ): void;

    /**
     * Managing columns
     */
    $addProp(name: string, options: Partial<PropOptions>): PropOptions;
    $hasProp(name: string): boolean;
    $getProp(name: string): JobPropOptions | undefined;

    /**
     * Boot job
     */
    boot(): void;

    dispatch<Payload extends any>(payload: Payload): Promise<void>;

    new (): JobHandlerContract;
  }

  /**
   * ------------------------------------------------------
   * Decorators and Options
   * ------------------------------------------------------
   */

  /**
   * Options for defining a prop
   */
  export type PropOptions = {
    propName: string; // job prop name

    /**
     * Invoked before serializing process happens
     */
    serialize?: (value: any, attribute: string, job: JobHandlerContract) => any;

    /**
     * Invoked before create or update happens
     */
    prepare?: (value: any, attribute: string, job: JobHandlerContract) => any;

    /**
     * Invoked when job is fetched from the queue
     */
    consume?: (value: any, attribute: string, job: JobHandlerContract) => any;
  };

  /**
   * Shape of props options after they have set on the job
   */
  export type JobPropOptions = PropOptions & {
    hasGetter: boolean;
    hasSetter: boolean;
  };

  export const prop: PropDecorator;

  export const Job: QueueJob;
}
