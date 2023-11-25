import { test } from '@japa/runner';

test.group('Http Server / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
