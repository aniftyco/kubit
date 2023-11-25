import { test } from '@japa/runner';

test.group('Logger / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
