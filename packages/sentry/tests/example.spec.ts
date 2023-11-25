import { test } from '@japa/runner';

test.group('Sentry / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
