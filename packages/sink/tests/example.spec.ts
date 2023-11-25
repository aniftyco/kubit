import { test } from '@japa/runner';

test.group('Sink / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
