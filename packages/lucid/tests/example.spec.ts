import { test } from '@japa/runner';

test.group('Lucid / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
