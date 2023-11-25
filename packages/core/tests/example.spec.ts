import { test } from '@japa/runner';

test.group('Core / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
