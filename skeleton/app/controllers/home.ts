import { view } from "kubit:inertia";

export default class HomeController {
  public async index() {
    return view("home", { time: new Date().toISOString() });
  }
}
