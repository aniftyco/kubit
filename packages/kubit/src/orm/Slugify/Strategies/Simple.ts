import { LucidModel, SlugifyConfig, SlugifyStrategyContract } from '@ioc:Kubit/ORM';
import { string } from '@poppinss/utils/build/helpers';

/**
 * A simple strategy to generate slugs
 */
export class SimpleStrategy implements SlugifyStrategyContract {
  protected separator = this.config.separator || '-';
  protected maxLengthBuffer = 0;

  constructor(private config: SlugifyConfig) {}

  /**
   * Makes the slug out the value string
   */
  public makeSlug(_: LucidModel, __: string, value: string) {
    let baseSlug = string.toSlug(value, {
      replacement: this.separator,
      lower: true,
      strict: true,
    });

    /**
     * Limit to defined characters
     */
    if (this.config.maxLength) {
      baseSlug = string.truncate(baseSlug, this.config.maxLength - this.maxLengthBuffer, {
        completeWords: this.config.completeWords,
        suffix: '',
      });
    }

    return baseSlug;
  }

  /**
   * Returns the slug as it is
   */
  public async makeSlugUnique(_: LucidModel, __: string, slug: string) {
    return slug;
  }
}
