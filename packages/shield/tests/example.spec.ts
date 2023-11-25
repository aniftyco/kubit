import { test } from '@japa/runner';

test.group('Shield / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
