import { test } from '@japa/runner';

test.group('Env / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
