import { test } from '@japa/runner';

test.group('Auth / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
