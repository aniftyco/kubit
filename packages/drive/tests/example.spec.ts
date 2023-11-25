import { test } from '@japa/runner';

test.group('Drive / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
