import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from '../src/Icon.js';

describe('Icon', () => {
  it('renders an svg for a kebab-case name', () => {
    const { container } = render(<Icon name="chevron-down" />);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('[data-kubit-icon]')).not.toBeNull();
  });

  it('renders the filled variant', () => {
    const outline = render(<Icon name="user" />).container.innerHTML;
    const filled = render(<Icon name="user" variant="filled" />).container.innerHTML;

    expect(filled).not.toBe(outline);
  });

  it('hides decorative icons from assistive technology', () => {
    const { container } = render(<Icon name="chevron-down" />);

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves a named icon exposed', () => {
    const { container } = render(<Icon name="user" aria-label="Account" />);

    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Account');
    expect(container.querySelector('svg')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('sizes from a token by default', () => {
    const { container } = render(<Icon name="user" />);

    expect(container.querySelector('svg')?.getAttribute('class')).toContain('size-icon');
  });

  it('lets a consumer class displace the size token', () => {
    const { container } = render(<Icon name="user" className="size-8" />);

    const className = container.querySelector('svg')?.getAttribute('class');

    expect(className).toContain('size-8');
    expect(className).not.toContain('size-icon');
  });

  it('raises on an unknown icon name', () => {
    expect(() => render(<Icon name="definitely-not-an-icon" />)).toThrow(/Unknown icon/);
  });
});
