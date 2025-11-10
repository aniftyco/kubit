import { Mailable } from 'kubit:mail';
import { property } from 'kubit:queue';

export class ExampleMail extends Mailable {
  @property()
  public name: string;

  @property()
  public email: string;

  async handle() {
    return this.view('emails.example', { name: this.name, email: this.email });
  }
}
