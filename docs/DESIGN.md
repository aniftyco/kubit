# Kubit — Design

A Tailwind-styled UI library shipping two implementations of one design system:

| Stack          | Install                           | Registry  |
| -------------- | --------------------------------- | --------- |
| Blade/Livewire | `composer require aniftyco/kubit` | Packagist |
| React          | `npm i kubit`                     | npm       |

Components use `<kubit:button />` in Blade and `<Button />` in React. MIT, fully open.

**The standard is feel.** A user moving between the two stacks should not be able to tell them apart — same look, same
behavior, same rhythm. Each stack reaches that its own way: React composes `@base-ui/react`, Alpine uses whatever core
libraries suit it. Where one library serves both well, reach for it.

## Repo layout

Composer requires its manifest at the repo root, so PHP owns the root and React lives in a subdirectory. Both packages
publish directly from this repo.

```
aniftyco/kubit/
├─ composer.json              → aniftyco/kubit  (PSR-4 NiftyCo\Kubit\ → src/)
├─ src/
│  ├─ KubitServiceProvider.php
│  ├─ KubitTagCompiler.php
│  ├─ AssetManager.php
│  ├─ Kubit.php / KubitManager.php
│  └─ Console/PublishCommand.php
├─ stubs/resources/views/kubit/   → Blade components
├─ resources/css/kubit.css        → the design system
├─ alpine/                        → Alpine plugin source
├─ dist/                          → built kubit.js, kubit.css
├─ react/                         → npm: kubit
├─ website/                       → docs site (Laravel app)
└─ docs/                          → written docs
```

## Blade

### Tag compilation

Laravel's `ComponentTagCompiler` hardcodes its tag regex to `x[-\:]`, so `<kubit:button />` is not natively supported.
`KubitTagCompiler extends ComponentTagCompiler` and overrides `compileOpeningTags`, `compileSelfClosingTags`, and
`compileClosingTags`, substituting `kubit[\:]` and prefixing resolved names with `kubit::`.

Register it through `Blade::precompiler()`. Precompilers run after `compileComponentTags()`, so Laravel's own `x-` pass
has already finished and left `kubit:` tags untouched for a full compiler to pick up.

> Verified against `laravel/framework` ^13.7: `BladeCompiler.php:288-294` (precompiler loop),
> `ComponentTagCompiler.php:171` (`x[-\:]` regex).

The three regex blocks come from Laravel's `ComponentTagCompiler`, which is MIT.

Also worth carrying over: inline `slot="…"` support on self-closing tags.

### Component resolution

Two `anonymousComponentPath` registrations, user path first:

```php
if (file_exists(resource_path('views/kubit'))) {
    Blade::anonymousComponentPath(resource_path('views/kubit'), 'kubit');
}

Blade::anonymousComponentPath(__DIR__.'/../stubs/resources/views/kubit', 'kubit');
```

Published components shadow packaged ones, which gives `php artisan kubit:publish` for free. Subdirectories become
dot-notation: `stubs/…/menu/item.blade.php` → `<kubit:menu.item />`.

### Assets

Served over a route: `/kubit/kubit.js` returns a file response carrying a version hash from `dist/manifest.json`,
emitted by a `@kubitScripts` directive. Upgrading the package picks up the new assets on its own.

### Performance

`livewire/blaze` ^1.0 is a hard requirement. It compiles anonymous components into plain PHP functions, which is where
the bulk of Blade component overhead goes — the difference is large enough that a component library should assume it
rather than treat it as an upgrade.

`KubitServiceProvider` registers the directories, mirroring the two `anonymousComponentPath` calls:

```php
Blaze::optimize()
    ->in(__DIR__.'/../stubs/resources/views/kubit')
    ->in(__DIR__.'/../stubs/resources/views/kubit/icon', memo: true)
    ->in(resource_path('views/kubit'));
```

The published path is registered too, and that matters more than it looks: cross-boundary `@aware` only propagates when
both parent and child are compiled by Blaze. `<kubit:field>` handing context down to `<kubit:input>` breaks the moment
one of them is published and the other isn't.

| Strategy  | Where                                                            |
| --------- | ---------------------------------------------------------------- |
| `compile` | Everywhere. The default, safe on any template.                   |
| `memo`    | Icons. Heavily repeated and a pure function of name and variant. |
| `fold`    | Per component, once benchmarked.                                 |

**Every attribute a component reads off the bag rather than through `@props` goes in `unsafe`.**

```blade
@blaze(fold: true, unsafe: ['class', 'icon:class', 'icon:variant'])
```

Folding substitutes dynamic pass-through attributes back into the output _after_ the component has been pre-rendered. A
dynamic `:class` therefore arrives too late for `clsx()` to merge against, and the compiled view keeps both the
component default and the consumer's override — the exact conflict the merge exists to resolve, reintroduced silently.

Marking an attribute unsafe aborts folding only when that attribute is genuinely dynamic. Static usage, including
`class="text-lg"`, still folds.

**The list is not just `class`.** Namespaced pass-through attributes are read off the bag above `@props`, so nothing
declares them and nothing aborts the fold for them. `:icon:class="$c"` folds anyway and lands unmerged;
`:icon:variant="$v"` folds anyway and renders the wrong icon. Both fail silently and only under a dynamic value, which
is the hardest way to notice. Every key a component plucks belongs in `unsafe` alongside `class` — Flux's own button
does exactly this.

> Verified on Blaze 1.0.13 / Laravel 13. `<x-btn :class="$c">` folded to `text-sm … <?php echo e($c); ?>`, yielding
> `text-sm text-xl` in the output. With `unsafe: ['class']` the same call renders `text-xl` alone, and the static cases
> still emit `[BlazeFolded]` markers.

Folding aborts when a dynamic value reaches a prop declared in `@props`, which describes Kubit's `variant` and `size`
props exactly — they pick class strings, so they're used in internal logic and can't be marked `safe`. In practice
that's fine: `variant="primary"` folds, `:variant="$x"` falls back to `compile`, and both are correct. Enabling fold is
a per-component call backed by a benchmark.

`@unblaze` carves dynamic sections out of an otherwise foldable component, passing what it needs through `scope`. The
validation block inside `field` is the case it exists for.

Two constraints follow from depending on Blaze, and both are permanent:

- **Components stay anonymous.** Blaze doesn't compile class-based components.
- **Components render through the component tag.** `view()` won't reach them.

### Component conventions

Flux is the reference for the Blade side. These are the conventions worth carrying, and the reasons they hold.

**Class assembly.** Feed `Kubit\clsx()` one `match` per _visual concern_ — background, then text, then border, then
shadow — rather than one arm per variant. A variant's full appearance stays readable as a column down the file, and
adding a concern touches one block instead of every arm. Omit the `default` arm so an unknown variant raises
`UnhandledMatchError` at the point of use.

**Colors are written out longhand.** Tailwind's scanner sees literal strings only, so every color × variant combination
is spelled out. Tedious, and the alternative silently ships unstyled components.

**Two families of data attribute, doing different jobs:**

| Family                | Example                                 | Purpose                                                   |
| --------------------- | --------------------------------------- | --------------------------------------------------------- |
| Identity              | `data-kubit-button`, `data-kubit-label` | Structural styling — parents select children through them |
| State (Base UI names) | `data-disabled`, `data-open`            | Styling hooks for consumers                               |

Identity markers are how a parent handles spacing and layout for its children without drilling props through every
level: `*:data-kubit-label:mb-3` on a field beats passing a `spacing` prop down.

**Namespaced pass-through attributes.** `icon:class`, `label:badge`, `error:bag` let a consumer reach an inner element
without recomposing from parts. They're read off the bag and removed in one step, above `@props`, so they never render
as stray HTML:

```blade
@php
  $iconClass ??= $attributes->pluck('icon:class');
@endphp

@props(['iconClass' => null])
```

The `??=` placement matters — a variable already defined beats both the attribute and the default, which is what makes
this work.

**Conditional wrappers.** `with-field`, `with-tooltip` and friends wrap the slot when their trigger prop is present and
pass it straight through when it isn't. That's what lets `<kubit:input>` grow a label, description, and error message
from attributes alone.

**Variant dispatch by delegation.** A component with several structural variants becomes a router that forwards
everything — data, attributes, named slots — to `variants/{name}`. Keeps each variant a flat readable file.

**Polymorphism, and its foldability tax.** An `as` prop plus the presence of `href` picks the element. Anything reading
request state — current-route detection, `$errors` — can't fold, so it lives in a separate file from the pure version,
and components pick whichever they need. Flux ships `button-or-link` and `button-or-link-pure` for exactly this.

**Raw `<?php if ?>` over `@if`** inside component bodies, so folding can evaluate the branch.

**Livewire ergonomics** worth matching: `name` defaults from `wire:model`, buttons infer their loading state from
`type="submit"` or a `wire:click`, and `wire:target` is set so two buttons calling the same method don't spin each
other.

**Accessibility as a floor:** every user-facing string through `__()`, `aria-hidden` on decorative icons, `aria-label`
on icon-only controls, `role="alert"` on error output.

**Behavior is Alpine's job.** Flux puts interactivity in custom elements (`ui-checkbox`, `ui-modal`) with Blade as pure
markup. Kubit keeps Alpine as the base, so the presentational conventions above carry over directly while the
interactive components are designed fresh.

### Supporting pieces

- `ComponentAttributeBag::pluck($key)` macro — get and unset in one call.

## Design system

`kubit.css` is the single source of truth. Idiomatic Tailwind v4 tokens, no vendor prefix on any class name.

```css
@theme {
  --color-accent: var(--color-zinc-900);
  --color-accent-content: var(--color-zinc-900);
  --color-accent-foreground: var(--color-white);
  --radius-control: 0.5rem;
  --spacing-control: 2.25rem;
}

@custom-variant dark (&:where(.dark, .dark *));
```

Components write ordinary utilities — `bg-accent`, `rounded-control`, `h-control`. Reskinning Kubit means overriding
tokens in your own `@theme` block.

The file lives once at `resources/css/kubit.css`. A build step copies it to `react/dist/kubit.css`; CI asserts the two
are byte-identical.

### Light and dark

Every token carries a deliberately chosen value per mode. Dark is designed, not derived.

A theme is valid when both of its modes satisfy the same contract:

| Requirement                             | Threshold |
| --------------------------------------- | --------- |
| Text on a solid fill                    | 4.5:1     |
| A solid fill against the page behind it | 3:1       |
| A border against its surface            | 3:1       |

These are theme-independent, which is the point — the contrast assertion validates whatever theme is loaded, so a brand
hue someone drops in gets held to the same bar as the ones we ship. They're also what a theme editor checks against
later.

Satisfying them tends to move a hue in _opposite_ directions between modes: light wants a darker step under a light
foreground, dark wants a lighter and less saturated step under a dark one. Worked through with a mid-scale green, to
make the shape concrete:

| Fill                    | vs page | text on fill |
| ----------------------- | ------- | ------------ |
| step 700, on white      | —       | 5.48:1 white |
| step 700, on `zinc-900` | 3.23:1  | —            |
| step 500, on `zinc-900` | 6.98:1  | 8.28:1 dark  |

Carry the light-mode step straight into dark and the control nearly vanishes into the page. The accent has to move a
step _and_ flip its foreground — opposite directions on both axes. No formula produces that.

The rest of the surface behaves the same way:

| Concern    | Light                       | Dark                                              |
| ---------- | --------------------------- | ------------------------------------------------- |
| Elevation  | shadow against a white page | a lighter surface — shadow stops reading          |
| Borders    | darker than their surface   | lighter than their surface, and need more of it   |
| Saturation | full-strength hues sit well | the same hues glare; they want lifting and muting |
| Extremes   | a pure white page           | `zinc-900` over black, off-white over pure white  |

Each pair gets chosen and reviewed on its own, which is why the kitchen sink renders both modes side by side.

A contrast assertion covers every solid variant in both modes — text against fill, and fill against page — so a token
change that quietly drops a pair below AA fails the build.

### Consumer install

Both packages need an explicit `@source` pointing at the installed markup:

```css
/* Blade */
@import 'tailwindcss';
@import '../../vendor/aniftyco/kubit/resources/css/kubit.css';
@source "../../vendor/aniftyco/kubit/stubs";

/* React */
@import 'tailwindcss';
@import 'kubit/kubit.css';
@source "../node_modules/kubit/dist";
```

`artisan kubit:install` writes these lines into the app's stylesheet.

## Class composition

Consumer classes have to beat component defaults. Both stacks get there the same way, through a helper both call `clsx`,
so the habit carries across and components and app code are written alike.

**React** — `import { clsx } from 'kubit'`, over `clsx` ^2.1.1 and `tailwind-merge` ^3.6.0:

```ts
import { clsx as classNames, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const clsx = (...inputs: ClassValue[]) => twMerge(classNames(inputs));
```

**Blade** — `Kubit\clsx()`, namespaced so it can't collide with an app's own helpers and loaded through composer's
`autoload.files`. It accepts strings or conditional arrays (`['bg-accent' => $isPrimary]`) and merges through a
`TailwindMerge` instance bound to a Kubit-specific container key. Components and application code use the same helper.

Merging is what makes overriding predictable: a consumer's `text-lg` displaces the component's `text-sm` rather than
sitting beside it and winning or losing on cascade order. The alternative — tagging individual defaults at zero
specificity — asks whoever writes the component to guess which classes someone might override, and a wrong guess fails
silently at the call site.

The `!` modifier stays available for the rare default that must survive an override.

Blaze folds components that call `clsx()`. Folding pre-renders with static props, so the merge runs at compile time and
lands in the compiled view as a literal class string — the folded path costs nothing at render time, and `withCache()`
covers the rest. See **Performance** for the one directive parameter this depends on.

Merging runs on the core `gehrisandro/tailwind-merge-php` ^1.2.0, which needs only PHP ^8.2 and `psr/simple-cache`. A
dependency that light keeps Kubit's supported framework range as wide as Laravel's own.

```php
$this->app->singleton('kubit.tailwind-merge', fn () => TailwindMerge::factory()
    ->withConfiguration(V4Config::make())
    ->withCache($cache)
    ->make());
```

`withCache()` is load-bearing — merging runs per element, and a page of Kubit components renders a lot of elements.

### Tailwind v4 conflict groups

tailwind-merge-php's conflict groups are v3-era; upstream issues #16 and #17 are open. Kubit ships `V4Config` to cover
the v4-only groups — `size-*`, `bg-linear-*` / `bg-radial-*`, the reworked `shadow-*` scale, `inset-shadow-*`,
`text-shadow-*` — with a Pest suite asserting merge outcomes per group. When upstream ships v4 support, the patch drops
out and the tests stay.

## Customization

Two levers, and the first one has to be enough on its own for most people.

### Theming — replace the tokens

Dropping in a replacement `@theme` block must completely change how Kubit looks, the way tweakflux.dev does for Flux.
That holds exactly as long as every visual decision routes through a token, so it is a hard rule:

```blade
<button class="bg-accent rounded-control text-accent-foreground"></button>
```

Anything carrying visual identity — color, radius, shadow, typography, control sizing — is a token. Structural utilities
like `flex`, `grid`, and `items-center` stay raw.

A lint over both component sets enforces this and fails CI on a raw palette utility. It's what keeps the rule true a
year in, when the reskin promise is load-bearing for every consumer.

The token list is therefore a public API surface and versioned like one — renaming a token is a breaking change. A theme
is then just a CSS file overriding `@theme` values, shareable as a paste-able snippet, and it works identically in both
stacks because both read the same names.

### Composition — replace the structure

Every component ships two tiers. The convenience component covers the common case; underneath it, the same thing is
available as parts you can rearrange.

```tsx
<Select items={options} placeholder="Pick one" />

<Select.Root>
  <Select.Trigger>…</Select.Trigger>
  <Select.Popup>
    <Select.Item>…</Select.Item>
  </Select.Popup>
</Select.Root>
```

```blade
<kubit:select :options="$options" placeholder="Pick one" />

<kubit:select.root>
  <kubit:select.trigger>…</kubit:select.trigger>
  <kubit:select.popup>
    <kubit:select.item>…</kubit:select.item>
  </kubit:select.popup>
</kubit:select.root>
```

React part names follow base-ui's, because the parts are base-ui's. Blade mirrors those names so the mental model
transfers.

Kubit forwards base-ui's `render` prop untouched, so any element can be swapped or composed with another component.
Blade's equivalent is an `as` attribute where it makes sense.

Convenience components also take named slots for the positions people actually reach for — a select's empty state, a
field's hint. Dropping to parts is there for when the structure itself needs to change.

### State styling

State is exposed as `data-*` attributes following Base UI's convention exactly, and the Alpine components mirror the
same names. One idiom across both stacks:

```
data-disabled:opacity-50   data-loading:animate-pulse   data-[side=top]:mb-2
```

**Orthogonal booleans get their own presence attribute; only genuinely mutually-exclusive enums carry a value.**
`data-disabled`, `data-loading`, `data-highlighted`, `data-selected`, `data-open`, and `data-closed` are presence-only.
`data-side="top"` and `data-align="start"` carry values because they're one-of-many.

Three things make this the right shape. States compose — a button can be disabled and loading at the same time — and
independent attributes express that with nothing to encode. Tailwind's bare `data-x:` shorthand is itself a presence
check, so the common case stays terse at every call site. And Base UI emits exactly these names, so both stacks share
one vocabulary with nothing to translate between them.

Verified against Tailwind 4.1.18: `data-disabled:opacity-50` compiles to `&[data-disabled]`, and `data-[side=top]:mt-2`
to `&[data-side="top"]`.

On the React side `className` also accepts Base UI's state callback, which Kubit passes through unchanged.

## Icons

Tabler, MIT, wrapped behind Kubit's own icon component that standardizes the `data-kubit-icon` hook, the decorative
default, and the `size-icon` token.

```blade
<kubit:icon name="chevron-down" />
<kubit:icon name="user" variant="filled" />
```

```tsx
import { IconChevronDown, IconUserFilled } from '@tabler/icons-react';

<Icon as={IconChevronDown} />
<Icon as={IconUserFilled} />
```

The two stacks address an icon differently, by design. Blade names it as a kebab-case string and resolves the glyph
server-side; a `variant="filled"` picks the filled cut. React takes the Tabler component itself through `as`, so the
consumer imports the exact export they want (`IconUser` versus `IconUserFilled`) and there is no name to resolve and no
`variant` — the choice of cut is which component you import. It is not a 1-to-1 API: a Blade `name` has no React
equivalent, and a React `as` has no Blade equivalent.

| Stack | Provider                           |
| ----- | ---------------------------------- |
| Blade | `secondnetwork/blade-tabler-icons` |
| React | `@tabler/icons-react`              |

Both pin the same Tabler version, and CI asserts the composer and npm versions match. Without that check the two stacks
drift the moment one gets bumped and the other doesn't — a missing icon on one side is obvious, but a _redrawn_ icon is
exactly the kind of difference nobody notices until it looks wrong.

The Blade provider is community-maintained. It currently tracks upstream within days (v3.46.0 shipped the same week as
Tabler's), but that's someone's goodwill rather than a guarantee. Wrapping it means replacing it later touches one
component instead of every call site.

Icons inherit `currentColor` and size from a token, so they respond to a theme swap like everything else.

## React package

Built with `tsc` to `dist/`, ESM, `files: ["dist"]`, `prepublishOnly` runs the build — matching the existing `aniftyco`
JS packages. Compiling straight through preserves tree-shaking and keeps class strings literal in the output.

Behavior comes from `@base-ui/react` ^1.6.0. Runtime deps: `clsx`, `tailwind-merge`. Peers: `react` / `react-dom` 19.

API parity is mechanical:

```
<kubit:button variant="primary" />   →   <Button variant="primary" />
<kubit:menu.item />                  →   <Menu.Item />
<kubit:field> … </kubit:field>       →   <Field> … </Field>
```

## Alpine layer

`alpine/` holds the Alpine plugin, built with Vite in lib mode to a single IIFE at `dist/kubit.js` for `AssetManager` to
serve. It registers `Alpine.plugin(kubit)`.

Positioning goes through `@floating-ui/dom`, which is what `@base-ui/react` uses underneath via `@floating-ui/react-dom`
— anchoring and collision handling are solved, and both stacks get the same solution for free. Where a library base-ui
uses has a vanilla sibling that fits Alpine, reach for it; otherwise pick whatever gets Alpine to the same feel.

## Testing

| Target              | Tooling                              |
| ------------------- | ------------------------------------ |
| PHP                 | Pest 5 + `orchestra/testbench`, Pint |
| `react/`, `alpine/` | vitest                               |
| visual parity       | Playwright                           |

### Visual parity

Parity is measured per component, in isolation, against dedicated fixtures. Keeping the fixtures separate from the docs
site means a docs layout change can't break component tests, and a docs bug can't hide a component one.

Each component gets a case file naming every variant and state worth pinning:

```json
// tests/visual/cases/button.json
[
  { "name": "primary", "props": { "variant": "primary" }, "slot": "Save" },
  { "name": "primary-disabled", "props": { "variant": "primary", "disabled": true }, "slot": "Save" },
  { "name": "danger-loading", "props": { "variant": "danger", "loading": true }, "slot": "Delete" }
]
```

Two minimal fixture apps read those files and render exactly one case per page on a bare background, nothing but the
component. Playwright drives both, screenshots the element's bounding box, and pixel-diffs the pair.

Playwright drives it because the comparison is cross-stack: one tool visiting both fixtures gives one diff mechanism and
one report.

The case files are the contract. Adding a variant means adding a case, and that case immediately binds both stacks; a
case that renders in one and not the other fails rather than quietly skipping.

Each case carries its own small pixel tolerance. Both stacks run in the same browser with the same fonts and viewport,
so differences trace to structure — and "structurally different, visually identical" lands a pixel or two apart often
enough that the tolerance is what keeps the suite worth listening to. Per-case, so a fussy component can be tightened on
its own.

### Kitchen sink

One page renders every component at once, under a fixture theme deliberately far from the default — different hues,
different radii, different control sizing. Both stacks render it, and the suite makes three comparisons:

| Comparison                         | Proves                               |
| ---------------------------------- | ------------------------------------ |
| Blade vs React, default theme      | the stacks match                     |
| Blade vs React, fixture theme      | they respond to theming the same way |
| Default vs fixture, within a stack | every component visibly changed      |

That third one is the interesting one. A component with a hardcoded `bg-zinc-900` sails through pair comparison, because
both stacks are wrong in exactly the same way — but under a theme that moves every token, it sits there unchanged while
everything around it shifts. The token lint catches this statically; this catches what the lint's pattern list misses.

The kitchen sink is also the only place components appear in each other's company, which is where spacing, alignment,
and optical weight between components actually show up.

The suite measures appearance because appearance is the contract. The two implementations may emit whatever markup suits
them, and must look and feel the same.

## v1 scope

```
button   input    textarea  select   checkbox
radio    switch   badge     heading  text
separator icon    field     label    error
─────────────────────────────────────────────
dropdown + menu.item   ← the spike
```

`field`/`label`/`error` make forms pleasant, so they ship early. Dropdown is deliberate: it is the first component whose
behavior isn't just markup, which makes it the first place the two stacks can plausibly feel different. Finding out how
hard that is to close at component 16 beats finding out at component 40.

After v1, fill in the inventory: modal, tooltip, table, navbar, toast, callout, tabs.

## Docs site

`website/` is a Laravel + Livewire app that also mounts the React components through Vite. Both implementations render
live; which one you see is part of the URL.

```
/docs/blade/button
/docs/react/button
```

The stack segment governs the whole page, not just code samples — install instructions, examples, prop tables, and API
notes all follow it. Someone reaching for Blade reads Blade docs and never scrolls past React they don't care about. The
toggle swaps the segment and keeps the slug, so you land on the same component in the other stack, and a remembered
preference redirects a bare `/docs/button` to the right variant.

The stack lives in the path, so every variant is separately linkable and separately indexable.

## Release

One tag ships both registries. Tagging `v0.2.0` fires the Packagist webhook, which picks up the composer package from
the root; a CI job runs `npm publish` from `react/`. Versions stay in lockstep.
