import { test } from '@japa/runner';

test.group('Config / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
