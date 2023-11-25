import { test } from '@japa/runner';

test.group('IoC Transformer / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
