import { IconChevronDown, IconUser } from '@tabler/icons-react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from '../src/Icon.js';

describe('Icon', () => {
  it('renders the icon component it is given', () => {
    const { container } = render(<Icon as={IconChevronDown} />);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('[data-kubit-icon]')).not.toBeNull();
  });

  it('hides decorative icons from assistive technology', () => {
    const { container } = render(<Icon as={IconChevronDown} />);

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes a labelled icon to assistive technology', () => {
    const { container } = render(<Icon as={IconUser} aria-label="Account" />);

    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Account');
    expect(container.querySelector('svg')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('sizes from a token by default', () => {
    const { container } = render(<Icon as={IconUser} />);

    expect(container.querySelector('svg')?.getAttribute('class')).toContain('size-icon');
  });

  it('lets a consumer class displace the size token', () => {
    const { container } = render(<Icon as={IconUser} className="size-8" />);

    const className = container.querySelector('svg')?.getAttribute('class');

    expect(className).toContain('size-8');
    expect(className).not.toContain('size-icon');
  });

  it('forwards svg props to the underlying icon', () => {
    const { container } = render(<Icon as={IconUser} size={40} />);

    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('width')).toBe('40');
    expect(svg?.getAttribute('height')).toBe('40');
  });
});
