# Kubit

A Tailwind CSS UI library with two implementations of one design system — Blade/Livewire components for Laravel, and
React components built on [Base UI](https://base-ui.com).

```blade
<kubit:button variant="primary">Save</kubit:button>
```

```tsx
<Button variant="primary">Save</Button>
```

Same design, same tokens, same feel. Use whichever stack your app is already in.

## Status

**Exploratory.** Nothing is published yet and the API isn't settled. `button` and `icon` are implemented in both stacks
and pinned against each other by a pixel-diff suite; the rest of the v1 inventory is not built. The design system's
token _values_ are placeholders — the names are settled, the colors are not.

The architecture is written up in [`docs/DESIGN.md`](docs/DESIGN.md), and what Kubit is trying to be is in
[`docs/VISION.md`](docs/VISION.md).

Two packages ship from this repo:

| Stack          | Package          | Registry  |
| -------------- | ---------------- | --------- |
| Blade/Livewire | `aniftyco/kubit` | Packagist |
| React          | `kubit`          | npm       |

## Theming

Every visual decision routes through a Tailwind `@theme` token, so replacing the token block reskins both stacks at
once. Components also expose their internal parts, for when a theme swap isn't enough and you need to recompose the
structure itself.

Custom tokens in non-color namespaces have to be declared to the class merger, or overriding them fails silently — see
`NiftyCo\Kubit\V4Config` and `SPACING_TOKENS` in `react/src/clsx.ts`.

## Working on Kubit

```bash
composer install
npm install
```

| Command               | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `composer test`       | Pest suite for the Blade package                          |
| `composer lint`       | Pint                                                      |
| `npm test`            | vitest suite for the React package                        |
| `npm run build`       | Build `react/dist`, including a copy of `kubit.css`       |
| `npm run fixtures`    | Render every visual case in both stacks                   |
| `npm run test:visual` | Pixel-diff the two stacks against each other              |
| `npm run check:css`   | Assert `kubit.css` is byte-identical across both packages |
| `npm run check:icons` | Assert both stacks pin the same Tabler version            |

Visual cases live in `tests/visual/cases/*.json` and are the cross-stack contract: adding a variant means adding a case,
and that case immediately binds both implementations.

### Conventions

**Flux is the reference for the Blade side**, and the bar is exact rather than approximate — if Flux solves something,
solve it the way Flux does. The conventions worth knowing are written up in [`docs/DESIGN.md`](docs/DESIGN.md); Flux
itself is the tiebreaker for anything they don't cover.

**Testbench caches compiled views between runs**, and a stale cache silently masks real breakage — a component that
should render will come out empty. When a test result doesn't match the code in front of you:

```bash
rm -rf vendor/orchestra/testbench-core/laravel/storage/framework/views/*
```

**A broken thing is a `->todo()`, never a `->skip()`.** Pest reports todos as outstanding work; a skip reads as
intentionally-not-applicable and nothing brings it back. `->skip()` is for a test that genuinely cannot run yet — the
contrast assertion, which is waiting on real token values, is the only one.

**No ignore files.** Prettier is scoped by its globs in `package.json`, not by a `.prettierignore`. Two things must stay
out of its reach: `*.blade.php`, because the shared config ships `prettier-plugin-blade` and would rewrite the component
stubs, and `resources/css/kubit.css`, which is byte-compared across both packages.

**Check both implementations side by side when adding a component.** The parity suite compares rendered pixels, so it
cannot see a divergence that doesn't change appearance — an identity attribute written `"1"` in one stack and `""` in
the other, an `aria-label` tested for presence here and truthiness there. Those are contract differences that ship
silently. Read the two files against each other, and pin anything structural with a test on both sides.

### Tag rewriting

Blaze's tokenizer only recognises the prefixes it ships with, so a `kubit:` tag is invisible to it — the component file
still gets compiled into a Blaze function while the call site stays on standard Blade, and the component renders as
nothing.

The provider therefore rewrites `<kubit:button>` to `<x-kubit::button>` through `prepareStringsForCompilationUsing`,
registered in `boot()`. Blaze registers its own precompiler only after the app has booted, so it sees tags that have
already been rewritten into a prefix it understands. This is the approach Blaze's maintainers recommend for a package
shipping its own tag syntax.

One consequence: components reference each other as `<x-kubit::icon />`. Blaze reads component files straight off disk,
outside Blade's pipeline, so no hook reaches a tag inside one. Consumer-facing code uses `<kubit:icon />` as normal.

## License

MIT
