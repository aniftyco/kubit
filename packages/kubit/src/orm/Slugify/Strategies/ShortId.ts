import { nanoid } from 'nanoid';

import { LucidModel, SlugifyStrategyContract } from '@ioc:Kubit/ORM';

import { SimpleStrategy } from './Simple';

/**
 * A Short id strategy that appends a shortid to the base slug
 */
export class ShortIdStrategy extends SimpleStrategy implements SlugifyStrategyContract {
  protected maxLengthBuffer = 11;

  /**
   * Add shortid to the slug
   */
  public async makeSlugUnique(_: LucidModel, __: string, slug: string) {
    return `${slug}-${nanoid(this.maxLengthBuffer - 1)}`;
  }
}
