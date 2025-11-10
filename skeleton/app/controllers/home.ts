import { view } from 'kubit:inertia';
import { HttpContext } from 'kubit:server';
import { ExampleMail } from '@app/mail/example';

export default class HomeController {
  public async index() {
    return view('home', { time: new Date().toISOString() });
  }

  public async sendmail({ response }: HttpContext) {
    await ExampleMail.send({ name: 'User', email: 'user@example.com' });

    response.status = 204;
  }
}
