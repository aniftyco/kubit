<?php

/**
 * `@blaze(fold: true, unsafe: ['class'])` is on every component, and the second
 * parameter is the load-bearing one. Folding substitutes dynamic pass-through
 * attributes back in *after* the component has been pre-rendered, so a dynamic
 * `:class` arrives too late for clsx() to merge against and the compiled view
 * keeps both the component default and the consumer's override.
 *
 * Marking `class` unsafe aborts folding only when `class` is genuinely dynamic.
 * These four cases pin that boundary.
 */
it('folds a component with static props', function () {
    $compiled = $this->compiled('<kubit:button variant="primary">Save</kubit:button>');

    expect($compiled)->toContain('[BlazeFolded]');
});

it('falls back to compile when a prop is dynamic', function () {
    // `variant` and `size` pick class strings, so they are used in internal logic
    // and cannot be marked safe. A dynamic value on either drops to `compile`,
    // which is correct — just not free.
    $compiled = $this->compiled('<kubit:button :variant="$variant">Save</kubit:button>', ['variant' => 'primary']);

    expect($compiled)->not->toContain('[BlazeFolded]');
});

it('aborts the fold when class is dynamic, and the merge still wins', function () {
    $compiled = $this->compiled(
        '<kubit:button variant="primary" :class="$class">Save</kubit:button>',
        ['class' => 'text-xl']
    );

    expect($compiled)->not->toContain('[BlazeFolded]');

    $html = $this->render(
        '<kubit:button variant="primary" :class="$class">Save</kubit:button>',
        ['class' => 'text-xl']
    );

    expect($html)->toContain('text-xl')->not->toContain('text-sm');
});

it('folds a static consumer class and merges it at compile time', function () {
    $compiled = $this->compiled('<kubit:button variant="primary" class="text-xl">Save</kubit:button>');

    // The merge ran during folding, so the compiled view carries the resolved
    // class string and the override costs nothing at render time.
    expect($compiled)
        ->toContain('[BlazeFolded]')
        ->toContain('text-xl')
        ->not->toContain('text-sm');
});
