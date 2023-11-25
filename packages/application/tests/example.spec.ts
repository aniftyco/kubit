import { test } from '@japa/runner';

test.group('Application / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
