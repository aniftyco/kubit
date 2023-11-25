import { test } from '@japa/runner';

test.group('Scheduler / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
