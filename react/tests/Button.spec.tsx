import { IconCheck } from '@tabler/icons-react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../src/Button.js';

const button = () => screen.getByRole('button');

describe('Button', () => {
  it('renders a button element by default', () => {
    render(<Button>Save</Button>);

    expect(button()).toHaveProperty('tagName', 'BUTTON');
    expect(button().getAttribute('data-kubit-button')).toBe('');
    expect(button().textContent).toContain('Save');
  });

  it.each([
    ['primary', 'bg-accent'],
    ['outline', 'bg-surface'],
    ['ghost', 'bg-transparent'],
    ['subtle', 'bg-surface-hover'],
    ['danger', 'bg-danger'],
  ] as const)('applies the token for the %s variant', (variant, expected) => {
    render(<Button variant={variant}>Save</Button>);

    expect(button().className).toContain(expected);
  });

  it.each([
    ['xs', 'h-control-xs'],
    ['sm', 'h-control-sm'],
    ['base', 'h-control'],
  ] as const)('applies the control token for the %s size', (size, expected) => {
    render(<Button size={size}>Save</Button>);

    expect(button().className).toContain(expected);
  });

  // Matches the Blade component's missing `match` default arm: a typo'd variant is
  // loud at the call site rather than a button with no colour.
  it('raises on an unknown variant rather than rendering unstyled', () => {
    expect(() => render(<Button variant={'nope' as never}>Save</Button>)).toThrow(/Unhandled variant/);
  });

  it('raises on an unknown size', () => {
    expect(() => render(<Button size={'enormous' as never}>Save</Button>)).toThrow(/Unhandled size/);
  });

  it('lets a consumer class displace a component default', () => {
    render(<Button className="rounded-full">Save</Button>);

    expect(button().className).toContain('rounded-full');
    expect(button().className).not.toContain('rounded-control');
  });

  it('renders an anchor when given an href', () => {
    render(<Button href="/docs">Docs</Button>);

    const link = screen.getByRole('link');

    expect(link).toHaveProperty('tagName', 'A');
    expect(link.getAttribute('href')).toBe('/docs');
  });

  // A link isn't a form control, so `disabled` can't do the work. Blade drops the
  // href and says so through aria; this pins React to the same bargain.
  it('drops the href on a disabled link and says so through aria', () => {
    render(
      <Button href="/docs" disabled>
        Docs
      </Button>
    );

    const link = screen.getByText(/Docs/).closest('[data-kubit-button]');

    expect(link).toHaveProperty('tagName', 'A');
    expect(link?.hasAttribute('href')).toBe(false);
    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');
    expect(link?.hasAttribute('data-disabled')).toBe(true);
  });

  it('passes a render prop through untouched', () => {
    // Swapping the element away from a <button> means taking on its semantics,
    // which is what nativeButton={false} tells Base UI.
    render(
      <Button render={<div />} nativeButton={false}>
        Save
      </Button>
    );

    expect(screen.getByText(/Save/).closest('[data-kubit-button]')).toHaveProperty('tagName', 'DIV');
  });

  it('marks a disabled button through the attribute and the state hook', () => {
    render(<Button disabled>Save</Button>);

    expect(button().hasAttribute('disabled')).toBe(true);
    expect(button().hasAttribute('data-disabled')).toBe(true);
  });

  it('renders a leading icon', () => {
    const { container } = render(<Button icon={IconCheck}>Save</Button>);

    expect(container.querySelector('[data-kubit-icon]')).not.toBeNull();
    expect(container.querySelector('[data-kubit-icon]')?.tagName).toBe('svg');
  });

  it('reaches the icon through iconClass', () => {
    const { container } = render(
      <Button icon={IconCheck} iconClass="size-6">
        Save
      </Button>
    );

    expect(container.querySelector('[data-kubit-icon]')?.getAttribute('class')).toContain('size-6');
  });

  it('squares a button that has an icon and no label', () => {
    render(<Button icon={IconCheck} aria-label="Save" />);

    expect(button().className).toContain('size-control');
  });

  it('shows the loading state through a data attribute', () => {
    const { container } = render(<Button loading>Save</Button>);

    expect(button().getAttribute('data-loading')).toBe('');
    expect(container.querySelector('[data-kubit-button-spinner]')).not.toBeNull();
  });

  it('leaves a plain button without a spinner', () => {
    const { container } = render(<Button>Save</Button>);

    expect(container.querySelector('[data-kubit-button-spinner]')).toBeNull();
  });
});
