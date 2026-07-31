# Kubit — Outstanding

What the scaffold doesn't cover yet. Delete this file once it's empty.

## Waiting on the design system

`resources/css/kubit.css` carries the settled token **names** at placeholder **values**. The emerald in it is a demo
accent, not Kubit's accent. When the real values land it is a value swap, nothing else moves.

`tests/Unit/ContrastTest.php` is written and skipped, with the thresholds documented in place. Fill it in when there are
chosen values to assert against.

## Kitchen sink

One page rendering every component at once, under a fixture theme deliberately far from the default, with three
comparisons:

| Comparison                         | Proves                               |
| ---------------------------------- | ------------------------------------ |
| Blade vs React, default theme      | the stacks match                     |
| Blade vs React, fixture theme      | they respond to theming the same way |
| Default vs fixture, within a stack | every component visibly changed      |

The third is the one the token lint can't do statically: a component with a hardcoded color sails through pair
comparison because both stacks are wrong identically, but sits unchanged under a theme that moves everything around it.

Worth building once the inventory is big enough for components to appear in each other's company — that's also where
spacing, alignment, and optical weight between components start to show.

## Deferred, each waiting on a specific component

| Deferred                                            | Waits on                                      |
| --------------------------------------------------- | --------------------------------------------- |
| `alpine/`, `dist/`, `AssetManager`, `@kubitScripts` | dropdown — the first component with behaviour |
| `website/`                                          | components worth documenting                  |

## Icons

Per-icon components: `<kubit:icon.chevron-down />` in Blade, mirroring Flux, which inlines each SVG into its own
component file and carries no icon-package dependency at all. React mirrors it with one named export per icon, which is
what makes it tree-shake.

Needs a generator that reads Tabler's raw SVGs and emits both. Until that lands the current name-resolving `icon`
component stays, and it pulls the whole Tabler set into a React bundle.
