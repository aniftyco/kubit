import type * as React from 'react';
import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@base-ui/react/button';
import { Icon, type IconVariant } from './Icon.js';
import { clsx } from './clsx.js';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'danger';

export type ButtonSize = 'xs' | 'sm' | 'base';

export interface ButtonProps extends Omit<BaseButtonProps, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Kebab-case icon name, rendered before the label. */
  icon?: string;
  /** Kebab-case icon name, rendered after the label. */
  iconTrailing?: string;
  iconClass?: string;
  iconVariant?: IconVariant;
  square?: boolean;
  loading?: boolean;
  href?: string;
  className?: string;
}

/**
 * Unknown values fail loudly rather than rendering a button with no colour, which
 * is the same reason the Blade component omits its `match` default arm.
 */
const pick = <T,>(map: Record<string, T>, key: string, concern: string): T => {
  const value = map[key];

  if (value === undefined) {
    throw new Error(`Unhandled ${concern} [${key}].`);
  }

  return value;
};

// One lookup per visual concern rather than one per variant, so a variant's full
// appearance reads as a column and adding a concern touches one block.
const BACKGROUND: Record<ButtonVariant, string> = {
  primary: 'bg-accent hover:bg-accent-hover',
  outline: 'bg-surface hover:bg-surface-hover',
  ghost: 'bg-transparent hover:bg-surface-hover',
  subtle: 'bg-surface-hover hover:bg-border',
  danger: 'bg-danger hover:bg-danger-hover',
};

const FOREGROUND: Record<ButtonVariant, string> = {
  primary: 'text-accent-foreground',
  outline: 'text-content',
  ghost: 'text-content',
  subtle: 'text-content',
  danger: 'text-danger-foreground',
};

const BORDER: Record<ButtonVariant, string> = {
  primary: 'border-transparent',
  outline: 'border-border-strong',
  ghost: 'border-transparent',
  subtle: 'border-transparent',
  danger: 'border-transparent',
};

const FOCUS: Record<ButtonVariant, string> = {
  primary: 'focus-visible:outline-accent',
  outline: 'focus-visible:outline-accent',
  ghost: 'focus-visible:outline-accent',
  subtle: 'focus-visible:outline-accent',
  danger: 'focus-visible:outline-danger',
};

const SIZING: Record<ButtonSize, { wide: string; square: string; icon: string; gap: string }> = {
  xs: { wide: 'h-control-xs px-2 text-xs', square: 'size-control-xs', icon: 'size-3.5', gap: 'gap-1.5' },
  sm: { wide: 'h-control-sm px-3 text-sm', square: 'size-control-sm', icon: 'size-4', gap: 'gap-2' },
  base: { wide: 'h-control px-4 text-sm', square: 'size-control', icon: 'size-4', gap: 'gap-2' },
};

export const Button = ({
  variant = 'outline',
  size = 'base',
  icon,
  iconTrailing,
  iconClass,
  iconVariant = 'outline',
  square = false,
  loading = false,
  disabled = false,
  href,
  className,
  children,
  render,
  ...props
}: ButtonProps) => {
  // An icon with nothing to label is a square button, so the common case doesn't
  // have to say so twice.
  const isSquare = square || (icon !== undefined && iconTrailing === undefined && !children);

  const sizing = pick(SIZING, size, 'size');

  const classes = clsx(
    'group relative inline-flex items-center justify-center',
    'cursor-pointer font-medium whitespace-nowrap select-none',
    'rounded-control border transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
    isSquare ? sizing.square : sizing.wide,
    pick(BACKGROUND, variant, 'variant'),
    pick(FOREGROUND, variant, 'variant'),
    pick(BORDER, variant, 'variant'),
    pick(FOCUS, variant, 'variant'),
    className
  );

  const iconProps = { variant: iconVariant, className: clsx(sizing.icon, iconClass) };

  const content = (
    <>
      <span
        data-kubit-button-content=""
        className={clsx('inline-flex items-center justify-center', sizing.gap, 'group-data-loading:invisible')}
      >
        {icon !== undefined && <Icon name={icon} {...iconProps} />}
        {children}
        {iconTrailing !== undefined && <Icon name={iconTrailing} {...iconProps} />}
      </span>

      {/*
        Blade emits this span whenever the button *could* spin — `loading`, a
        `type="submit"`, or any `wire:click` — because Livewire reveals it by
        setting `data-loading` at request time rather than re-rendering. React has
        no such out-of-band flip: a state change re-renders, so the node only
        needs to exist while `loading` is true. The `data-kubit-button-spinner`
        contract therefore differs by design, and the visual cases only pair the
        two stacks where `loading` is set. Don't "fix" this by always rendering
        it; that ships a hidden node on every React button for nothing.
      */}
      {loading && (
        <span
          data-kubit-button-spinner=""
          className="absolute inset-0 hidden place-items-center group-data-loading:grid"
        >
          <Icon name="loader-2" className={clsx(sizing.icon, 'animate-spin')} />
        </span>
      )}
    </>
  );

  const shared = {
    'data-kubit-button': '',
    'data-loading': loading ? '' : undefined,
    className: classes,
  };

  // A link that looks like a button is still a link. Routing it through Base UI's
  // Button would give it role="button" and a tabindex, which lies to assistive
  // technology about what activating it does. Blade splits this the same way.
  if (href !== undefined) {
    return (
      <a
        {...shared}
        href={disabled ? undefined : href}
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? -1 : undefined}
        data-disabled={disabled ? '' : undefined}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <BaseButton {...shared} disabled={disabled} render={render} {...props}>
      {content}
    </BaseButton>
  );
};
