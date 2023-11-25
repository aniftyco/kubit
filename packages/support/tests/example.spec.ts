import { test } from '@japa/runner';

test.group('Support / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
