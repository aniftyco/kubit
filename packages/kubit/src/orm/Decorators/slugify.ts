import { LucidModel, SlugifyConfig, SlugifyManagerContract } from '@ioc:Kubit/ORM';

import { Slugifier } from '../Slugify/Slugifier';

/**
 * Slugify classes exposes the "slugifyDecorator" method to be used
 * a decorator. The class is used so that we can inject the
 * slugifyManager via constructor. slugifyManager is required
 * to resolve strategies
 */
export class Slugify {
  constructor(private slugifyManager: SlugifyManagerContract) {}

  /**
   * To be exported from the container as a decorator
   */
  public slugifyDecorator(config: SlugifyConfig) {
    /**
     * Resolve strategy as soon as someone uses the decorator
     */
    const strategy =
      typeof config.strategy === 'string' ? this.slugifyManager.use(config.strategy, config) : config.strategy;

    return function decorateAsSlugify(target: any, property: string) {
      const Model = target.constructor as LucidModel;

      /**
       * Boot the model if not already booted
       */
      Model.boot();

      /**
       * Create slug before the model is persisted
       */
      Model.before('create', async function (row) {
        const rowModel = row.constructor as LucidModel;

        /**
         * Do not set slug when already defined manually
         */
        if (row[property]) {
          return;
        }

        const slug = await new Slugifier(strategy, rowModel, property, config).makeSlug(row);
        if (slug) {
          row[property] = slug;
        }
      });

      /**
       * Create slug before the model is updated, only when allowUpdates
       * is set to true.
       */
      Model.before('update', async function (row) {
        let allowUpdates = config.allowUpdates;
        allowUpdates = typeof allowUpdates === 'function' ? allowUpdates(row) : allowUpdates;

        /**
         * Return early when updates are disabled
         */
        if (allowUpdates !== true) {
          return;
        }

        const rowModel = row.constructor as LucidModel;

        /**
         * Do not set slug when already defined manually
         */
        if (row.$dirty[property] !== undefined) {
          return;
        }

        /**
         * Do not set slug when none of the sources are changed
         */
        if (!config.fields.find((field) => row.$dirty[field] !== undefined)) {
          return;
        }

        const slug = await new Slugifier(strategy, rowModel, property, config).makeSlug(row);
        if (slug) {
          row[property] = slug;
        }
      });
    };
  }
}
