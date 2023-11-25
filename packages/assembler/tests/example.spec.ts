import { test } from '@japa/runner';

test.group('Assembler / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});
