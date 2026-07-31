# Kubit — Vision

## What Kubit is

A Tailwind CSS component library that exists twice — once as Blade/Livewire components, once as React components on Base
UI — sharing a single design system.

One design system with two front doors.

## Who it's for

Kubit is the default starting point for any Laravel app built at AniftyCo, and the component layer of the SaaS starter
kit. Someone spinning up that kit picks Livewire or Inertia React based on how they want to build, and gets the same
design system either way — same look, same tokens, same component vocabulary.

That constraint is what makes Kubit worth building. Plenty of good React libraries exist and Flux covers Blade well, but
choosing a rendering stack shouldn't mean choosing a different visual language, and it shouldn't mean the starter kit
maintains two unrelated component sets.

Beyond that, anyone building on either stack who wants a themed component set they can own.

## Principles

These settle arguments. When a decision is close, the one that honors these wins.

**One design system, two implementations.** The bar is exact feel — a user moving between the two stacks shouldn't be
able to tell them apart. The bar is _not_ identical markup. Each stack is free to reach the same result the way that's
natural for it.

**Idiomatic in both worlds.** Blade components should feel like Blade to a Laravel developer, and React components
should feel like React. Neither side gets contorted to mirror the other's shape.

**Everything routes through a token.** Reskinning is a first-class operation, not an escape hatch. If a visual value
can't be changed by swapping the theme, that's a bug.

**Customization shouldn't cost you the component.** Every component ships a convenient version and the parts underneath
it. Wanting one thing different shouldn't mean rebuilding from scratch.

**Open, permanently.** MIT, no paid tier, no gated components.

## What Kubit is not

**Not a headless library.** Base UI is that, and Kubit is built on it. Kubit is the opinionated visual layer — it has a
point of view about how things should look.

**Not a CSS framework.** Tailwind is that. Kubit is components and a token surface.

**Not a React library with a Blade port, or the reverse.** Both stacks are first-class. Neither leads and neither
follows.

**Not an app scaffold.** Kubit ships components. Building the app is the starter kit's job.
