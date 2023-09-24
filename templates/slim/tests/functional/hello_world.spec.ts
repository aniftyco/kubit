import { test } from 'kubit';

test('display welcome page', async ({ client }) => {
  const response = await client.get('/');

  response.assertStatus(200);
  response.assertTextIncludes('Hello world');
});
