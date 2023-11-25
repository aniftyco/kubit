import { test } from '@japa/runner';

test.group('Hash / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
