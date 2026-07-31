import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { clsx, RADIUS_TOKENS, SPACING_TOKENS } from '../src/clsx.js';

describe('clsx', () => {
  it('merges conflicting utilities so the last one wins', () => {
    expect(clsx('text-sm', 'text-xl')).toBe('text-xl');
  });

  it('keeps non-conflicting utilities', () => {
    expect(clsx('inline-flex', 'items-center')).toBe('inline-flex items-center');
  });

  it('takes classes from conditional objects', () => {
    expect(clsx('h-control', { 'bg-accent': true, 'bg-danger': false })).toBe('h-control bg-accent');
  });

  it('ignores null, false, and undefined', () => {
    expect(clsx('inline-flex', null, false, undefined, 'gap-2')).toBe('inline-flex gap-2');
  });

  it('lets a consumer class displace a component default', () => {
    expect(clsx('rounded-control bg-accent text-sm', 'text-xl')).toBe('rounded-control bg-accent text-xl');
  });
});

describe('kubit theme tokens', () => {
  it('lets a utility override a radius token', () => {
    expect(clsx('rounded-control', 'rounded-full')).toBe('rounded-full');
  });

  it('lets a radius token override a utility', () => {
    expect(clsx('rounded-full', 'rounded-control')).toBe('rounded-control');
  });

  it.each<string>(SPACING_TOKENS)('merges the %s spacing token against a utility', (token) => {
    expect(clsx(`h-${token}`, 'h-8')).toBe('h-8');
  });

  it('merges size against the control token', () => {
    expect(clsx('size-control', 'size-8')).toBe('size-8');
  });
});

describe('token parity with kubit.css', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const css = readFileSync(resolve(here, '../../resources/css/kubit.css'), 'utf8');

  const keys = (namespace: string) => [
    ...new Set([...css.matchAll(new RegExp(`^\\s*--${namespace}-([\\w-]+):`, 'gm'))].map((m) => m[1])),
  ];

  it('registers every spacing token from kubit.css', () => {
    expect(keys('spacing').sort()).toEqual([...SPACING_TOKENS].sort());
  });

  it('registers every radius token from kubit.css', () => {
    expect(keys('radius').sort()).toEqual([...RADIUS_TOKENS].sort());
  });
});
