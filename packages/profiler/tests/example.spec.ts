import { test } from '@japa/runner';

test.group('Profiler / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
