import { PropDecorator, QueueJob } from '@ioc:Kubit/Queue';

/**
 * Define property on a job as a prop. The decorator needs a
 * proper job class inheriting the base job
 */
export const prop: PropDecorator = (options?) => {
  return function decorateAsProp(target, property) {
    const Job = target.constructor as QueueJob;
    Job.boot();
    Job.$addProp(property, options || {});
  };
};
