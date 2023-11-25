import { test } from '@japa/runner';

test.group('Session / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
