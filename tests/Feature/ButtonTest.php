<?php

it('renders a button element by default', function () {
    expect($this->render('<kubit:button>Save</kubit:button>'))
        ->toContain('<button')
        ->toContain('type="button"')
        ->toContain('data-kubit-button')
        ->toContain('Save');
});

it('applies the token for each variant', function (string $variant, string $expected) {
    expect($this->render("<kubit:button variant=\"{$variant}\">Save</kubit:button>"))
        ->toContain($expected);
})->with([
    ['primary', 'bg-accent'],
    ['outline', 'bg-surface'],
    ['ghost', 'bg-transparent'],
    ['subtle', 'bg-surface-hover'],
    ['danger', 'bg-danger'],
]);

it('applies the control token for each size', function (string $size, string $expected) {
    expect($this->render("<kubit:button size=\"{$size}\">Save</kubit:button>"))
        ->toContain($expected);
})->with([
    ['xs', 'h-control-xs'],
    ['sm', 'h-control-sm'],
    ['base', 'h-control'],
]);

// Omitting the `default` arm is deliberate: a typo'd variant should be loud at the
// call site rather than rendering a button with no colour. Blade wraps the error in
// a ViewException, so the assertion is on the cause.
it('raises on an unknown variant rather than rendering unstyled', function () {
    expect(fn () => $this->render('<kubit:button variant="nope">Save</kubit:button>'))
        ->toThrowCausedBy(UnhandledMatchError::class);
});

it('raises on an unknown size', function () {
    expect(fn () => $this->render('<kubit:button size="enormous">Save</kubit:button>'))
        ->toThrowCausedBy(UnhandledMatchError::class);
});

it('lets a consumer class displace a component default', function () {
    expect($this->render('<kubit:button class="rounded-full">Save</kubit:button>'))
        ->toContain('rounded-full')
        ->not->toContain('rounded-control');
});

it('renders an anchor when given an href', function () {
    expect($this->render('<kubit:button href="/docs">Docs</kubit:button>'))
        ->toContain('<a')
        ->toContain('href="/docs"');
});

it('honours an explicit as over href', function () {
    expect($this->render('<kubit:button as="div">Save</kubit:button>'))->toContain('<div');
});

it('marks a disabled button through the attribute and the state hook', function () {
    expect($this->render('<kubit:button disabled>Save</kubit:button>'))
        ->toContain('disabled')
        ->toContain('data-disabled');
});

it('drops the href on a disabled link and says so through aria', function () {
    $html = $this->render('<kubit:button href="/docs" disabled>Docs</kubit:button>');

    expect($html)
        ->toContain('aria-disabled="true"')
        ->not->toContain('href="/docs"');
});

it('renders a leading icon', function () {
    expect($this->render('<kubit:button icon="check">Save</kubit:button>'))
        ->toContain('<svg')
        ->toContain('data-kubit-icon');
});

it('reaches the icon through a namespaced attribute', function () {
    expect($this->render('<kubit:button icon="check" icon:class="size-6">Save</kubit:button>'))
        ->toContain('size-6')
        // The namespaced attribute is plucked off the bag, never rendered as HTML.
        ->not->toContain('icon:class');
});

/**
 * `icon:class` and `icon:variant` are plucked off the attribute bag rather than
 * declared as props, so folding treats them as pass-through and substitutes a
 * dynamic value back in *after* the component has pre-rendered — too late for the
 * pluck, and too late for the merge. Marking them unsafe aborts the fold when
 * they are genuinely dynamic, which is the only way the two forms can agree.
 */
it('merges a dynamic icon class the same way it merges a static one', function () {
    $static = $this->render('<kubit:button icon="check" icon:class="size-2">Save</kubit:button>');
    $dynamic = $this->render('<kubit:button icon="check" :icon:class="$size">Save</kubit:button>', ['size' => 'size-2']);

    expect($dynamic)->toBe($static);

    // The merge ran, so the button's own icon size is gone rather than sitting
    // beside the override and winning on source order.
    expect($dynamic)
        ->toContain('shrink-0 size-2')
        ->not->toContain('size-4');
});

it('honours a dynamic icon variant', function () {
    $outline = $this->render('<kubit:button icon="user">Save</kubit:button>');
    $static = $this->render('<kubit:button icon="user" icon:variant="filled">Save</kubit:button>');
    $dynamic = $this->render('<kubit:button icon="user" :icon:variant="$variant">Save</kubit:button>', ['variant' => 'filled']);

    expect($dynamic)->toBe($static)->not->toBe($outline);
});

it('squares a button that has an icon and no label', function () {
    expect($this->render('<kubit:button icon="check" aria-label="Save" />'))
        ->toContain('size-control');
});

describe('livewire ergonomics', function () {
    it('wires loading for a submit button', function () {
        expect($this->render('<kubit:button type="submit">Save</kubit:button>'))
            ->toContain('wire:loading.attr="data-loading"');
    });

    it('scopes loading to the method a click calls', function () {
        expect($this->render('<kubit:button wire:click="save">Save</kubit:button>'))
            ->toContain('wire:target="save"');
    });

    it('strips arguments from the wire target', function () {
        expect($this->render('<kubit:button wire:click="delete(1)">Delete</kubit:button>'))
            ->toContain('wire:target="delete"');
    });

    it('leaves a plain button unwired', function () {
        expect($this->render('<kubit:button>Save</kubit:button>'))
            ->not->toContain('wire:loading');
    });
});
