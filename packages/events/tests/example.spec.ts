import { test } from '@japa/runner';

test.group('Events / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
