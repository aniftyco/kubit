import { test } from '@japa/runner';

test.group('Require TS / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
