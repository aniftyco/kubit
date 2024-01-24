import { test } from '@japa/runner';

test.group('Pkg / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
