import { test } from '@japa/runner';

test.group('Bouncer / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
