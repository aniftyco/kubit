import { view } from 'kubit:inertia';
import { HttpContext } from 'kubit:server';

export default class HomeController {
  public async index({ response }: HttpContext) {
    response.status = 200;

    return view('home', { time: new Date().toISOString() });
  }
}
