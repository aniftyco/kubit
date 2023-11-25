import { test } from '@japa/runner';

test.group('Queue / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
