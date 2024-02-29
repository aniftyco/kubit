import { LucidModel } from '@ioc:Kubit/Lucid/Orm';
import { Exception } from '@poppinss/utils';

/**
 * Utility to consistently extract relationship keys from the model
 * and the relation model.
 */
export class KeysExtractor<Keys extends { [key: string]: { key: string; model: LucidModel } }> {
  constructor(
    private model: LucidModel,
    private relationName: string,
    private keys: Keys
  ) {}

  /**
   * Extract the defined keys from the models
   */
  public extract(): { [P in keyof Keys]: { attributeName: string; columnName: string } } {
    const relationRef = `${this.model.name}.${this.relationName}`;

    return Object.keys(this.keys).reduce(
      (result, extractKey: keyof Keys) => {
        const { key, model } = this.keys[extractKey];
        const attribute = model.$getColumn(key);

        if (!attribute) {
          throw new Exception(
            `"${relationRef}" expects "${key}" to exist on "${model.name}" model, but is missing`,
            500,
            'E_MISSING_MODEL_ATTRIBUTE'
          );
        }

        result[extractKey] = {
          attributeName: key,
          columnName: attribute.columnName,
        };

        return result;
      },
      {} as { [P in keyof Keys]: { attributeName: string; columnName: string } }
    );
  }
}
