import { test } from '@japa/runner';

test.group('Fold / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
