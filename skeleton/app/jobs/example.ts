import { Job, property } from 'kubit:jobs';

export class ExampleJob extends Job {
  @property()
  public name: string;

  @property()
  public message: string;

  async handle() {
    console.log(`Hello, ${this.name}! ${this.message}`);
  }
}
