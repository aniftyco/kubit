import { test } from '@japa/runner';

test.group('CORS / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
