import { Job } from '@kubit/queue';

export type Payload = {};

export default class ExampleJob extends Job<Payload> {
  public async handle() {
    console.log('Hello, world!');
  }
}
