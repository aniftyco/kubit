/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import User from '@app/Models/User';
import Route from '@ioc:Kubit/Route';

Route.group(() => {
  Route.get('/user', async () => {
    return User.firstOrFail();
  });
})
  .prefix('api')
  .middleware('auth:api');
