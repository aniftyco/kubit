import { Job, prop } from '@ioc:Kubit/Queue';

export default class ExampleJob extends Job {
  @prop()
  public name: string;

  public async handle() {
    console.log(`Hello, ${this.name}`);
  }
}
