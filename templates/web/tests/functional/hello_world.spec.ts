import { test } from '@japa/runner';

test('display welcome page', async ({ client }) => {
  const response = await client.get('/');

  response.assertStatus(200);
  response.assertTextIncludes('Congratulations, you have just created your first Kubit app.');
});
