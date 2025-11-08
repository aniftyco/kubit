import { Job } from "@app:jobs";

export default class ExampleJob extends Job {
  async handle() {
    // Job logic here
    console.log("Example job is being processed.");
  }
}
