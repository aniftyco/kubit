import { Mailable } from "@app:mail";

export class ExampleMail extends Mailable {
  async handle() {
    return this.view("emails.example", { name: "User" });
  }
}
