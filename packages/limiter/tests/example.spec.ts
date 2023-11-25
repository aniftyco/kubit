import { test } from '@japa/runner';

test.group('Limiter / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
