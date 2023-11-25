import { test } from '@japa/runner';

test.group('Bodyparser / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
