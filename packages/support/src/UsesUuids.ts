import { v4 as uuid } from 'uuid';

import { beforeCreate, column } from '@adonisjs/lucid/build/src/Orm/Decorators';

import type { LucidModel } from '@ioc:Adonis/Lucid/Orm';
import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers';

export const UsesUuids = <T extends NormalizeConstructor<LucidModel>>(Superclass: T) => {
  class ModelWithUuids extends Superclass {
    @column({ isPrimary: true })
    public id: string;

    @beforeCreate()
    public static async setIdWithUuid<Model extends ModelWithUuids>(model: Model) {
      model.id = uuid();
    }
  }

  return ModelWithUuids;
};
