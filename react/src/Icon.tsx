import type { IconProps as TablerIconProps, TablerIcon } from '@tabler/icons-react';
import { clsx } from './clsx.js';

export interface IconProps extends Omit<TablerIconProps, 'ref'> {
  /** A Tabler icon component, e.g. `IconHome` from `@tabler/icons-react`. */
  as: TablerIcon;
}

/**
 * The wrapper standardizes what every icon needs — the `data-kubit-icon` hook,
 * decorative-by-default `aria-hidden`, and the `size-icon` token — so call sites
 * pass a Tabler component and nothing else. Consumers import the icon they want
 * (`IconHome`, `IconHomeFilled`) and hand it in via `as`.
 */
export const Icon = ({ as: Component, className, ...props }: IconProps) => {
  return (
    <Component
      data-kubit-icon=""
      aria-hidden={props['aria-label'] ? undefined : true}
      className={clsx('size-icon shrink-0', className)}
      {...props}
    />
  );
};
