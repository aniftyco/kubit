import { test } from '@japa/runner';

test.group('Validator / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
