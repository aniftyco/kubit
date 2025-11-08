import { Job } from "@app:jobs";

export class ExampleJob extends Job {
  async handle() {
    // Job logic here
    console.log("Example job is being processed.");
  }
}
