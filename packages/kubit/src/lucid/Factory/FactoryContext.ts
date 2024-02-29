import { faker } from '@faker-js/faker';
import { TransactionClientContract } from '@ioc:Kubit/Lucid/Database';
import { FactoryContextContract } from '@ioc:Kubit/Lucid/Factory';

export class FactoryContext implements FactoryContextContract {
  public faker = faker;

  constructor(
    public isStubbed: boolean,
    public $trx: TransactionClientContract | undefined
  ) {}
}
