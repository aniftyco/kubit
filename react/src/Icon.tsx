import type { ComponentType } from 'react';
import * as TablerIcons from '@tabler/icons-react';
import type { IconProps as TablerIconProps } from '@tabler/icons-react';
import { clsx } from './clsx.js';

export type IconVariant = 'outline' | 'filled';

export interface IconProps extends Omit<TablerIconProps, 'ref'> {
  /** Kebab-case, matching the name on the Tabler site and the Blade component. */
  name: string;
  variant?: IconVariant;
}

const pascal = (name: string) =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/**
 * Wrapping the provider keeps it an implementation detail: replacing Tabler later
 * touches this file instead of every call site. The name is resolved rather than
 * imported so that a name copied from the Tabler site works unchanged in either
 * stack, exactly as it does in Blade.
 */
export const Icon = ({ name, variant = 'outline', className, ...props }: IconProps) => {
  const exportName = `Icon${pascal(name)}${variant === 'filled' ? 'Filled' : ''}`;
  const Component = (TablerIcons as unknown as Record<string, ComponentType<TablerIconProps>>)[exportName];

  if (!Component) {
    throw new Error(`Unknown icon [${name}] with variant [${variant}].`);
  }

  return (
    <Component
      data-kubit-icon=""
      aria-hidden={props['aria-label'] ? undefined : true}
      className={clsx('size-icon shrink-0', className)}
      {...props}
    />
  );
};
