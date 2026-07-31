import { clsx as classNames, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Kubit's own `--spacing-*` and `--radius-*` theme keys.
 *
 * tailwind-merge validates a class's value against the scale it belongs to, and
 * `control` is not a length. Without registering these, a component default and a
 * consumer override both survive the merge and fall back to cascade order —
 * silently, at the call site. Mirrors V4Config on the Blade side; the two are kept
 * honest by the token sync test.
 */
export const SPACING_TOKENS = ['control', 'control-sm', 'control-xs', 'icon'];

export const RADIUS_TOKENS = ['control'];

const merge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: SPACING_TOKENS,
      radius: RADIUS_TOKENS,
    },
  },
});

/**
 * Compose a class string, resolving Tailwind conflicts so the last value wins.
 *
 * Merging is what makes overriding predictable — a consumer's `text-lg` displaces
 * the component's `text-sm` rather than sitting beside it and winning or losing on
 * cascade order.
 */
export const clsx = (...inputs: ClassValue[]) => merge(classNames(inputs));
