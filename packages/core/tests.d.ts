declare global {
  export function it(description: string, fn: () => void | Promise<void>): void;

  export function expect<T>(value: T): {
    toBe(expected: T): void;
  };
}

export {};
