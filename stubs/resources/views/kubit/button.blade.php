@blaze(fold: true, unsafe: ['class', 'icon:class', 'icon:variant'])

@php
    $iconClass ??= $attributes->pluck('icon:class');
    $iconVariant ??= $attributes->pluck('icon:variant');
@endphp

@props([
    'variant' => 'outline',
    'size' => 'base',
    'icon' => null,
    'iconTrailing' => null,
    'iconClass' => null,
    'iconVariant' => 'outline',
    'square' => false,
    'loading' => null,
    'disabled' => false,
    'as' => null,
    'href' => null,
    'type' => null,
])

<?php
// An icon with nothing to label is a square button, so the common case doesn't
// have to say so twice.
$square = $square || ($icon !== null && $iconTrailing === null && $slot->isEmpty());

// Livewire ergonomics: a button that submits or calls a method is one that can
// spin, and scoping the target keeps two buttons calling different methods from
// spinning each other.
$wireClick = $attributes->whereStartsWith('wire:click')->first();
$wired = (bool) $wireClick || $type === 'submit';
$wireTarget = $wireClick ? \Illuminate\Support\Str::before(trim((string) $wireClick), '(') : null;

// `loading` is the visual state and is what React's prop of the same name does.
// The spinner also has to exist in the DOM for a wired button, because Livewire
// reveals it by adding `data-loading` at request time rather than re-rendering.
$loading = (bool) $loading;
$spinner = $loading || $wired;

$iconSize = match ($size) {
    'xs' => 'size-3.5',
    'sm' => 'size-4',
    'base' => 'size-4',
};

$classes = \NiftyCo\Kubit\clsx(
    // Base
    'group relative inline-flex items-center justify-center',
    'cursor-pointer font-medium whitespace-nowrap select-none',
    'rounded-control border transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'data-disabled:pointer-events-none data-disabled:opacity-50',

    // Sizing
    match ($size) {
        'xs' => $square ? 'size-control-xs' : 'h-control-xs px-2 text-xs',
        'sm' => $square ? 'size-control-sm' : 'h-control-sm px-3 text-sm',
        'base' => $square ? 'size-control' : 'h-control px-4 text-sm',
    },

    // Background
    match ($variant) {
        'primary' => 'bg-accent hover:bg-accent-hover',
        'outline' => 'bg-surface hover:bg-surface-hover',
        'ghost' => 'bg-transparent hover:bg-surface-hover',
        'subtle' => 'bg-surface-hover hover:bg-border',
        'danger' => 'bg-danger hover:bg-danger-hover',
    },

    // Foreground
    match ($variant) {
        'primary' => 'text-accent-foreground',
        'outline' => 'text-content',
        'ghost' => 'text-content',
        'subtle' => 'text-content',
        'danger' => 'text-danger-foreground',
    },

    // Border
    match ($variant) {
        'primary' => 'border-transparent',
        'outline' => 'border-border-strong',
        'ghost' => 'border-transparent',
        'subtle' => 'border-transparent',
        'danger' => 'border-transparent',
    },

    // Focus ring
    match ($variant) {
        'primary', 'outline', 'ghost', 'subtle' => 'focus-visible:outline-accent',
        'danger' => 'focus-visible:outline-danger',
    },

    $attributes->get('class'),
);

$state = array_filter([
    'data-kubit-button' => '',
    'data-disabled' => $disabled ? '' : null,
    'data-loading' => $loading ? '' : null,
    'wire:loading.attr' => $wired ? 'data-loading' : null,
    'wire:target' => $wired ? $wireTarget : null,
], fn ($value) => $value !== null);
?>

<x-kubit::button-or-link-pure
    :as="$as"
    :href="$href"
    :type="$type"
    :disabled="$disabled"
    class="{{ $classes }}"
    {{ $attributes->except('class')->merge($state) }}
>
    <span data-kubit-button-content class="inline-flex items-center justify-center {{ $size === 'xs' ? 'gap-1.5' : 'gap-2' }} group-data-loading:invisible">
        <?php if ($icon !== null) { ?>
            <x-kubit::icon :name="$icon" :variant="$iconVariant" :class="\NiftyCo\Kubit\clsx($iconSize, $iconClass)" />
        <?php } ?>

        {{ $slot }}

        <?php if ($iconTrailing !== null) { ?>
            <x-kubit::icon :name="$iconTrailing" :variant="$iconVariant" :class="\NiftyCo\Kubit\clsx($iconSize, $iconClass)" />
        <?php } ?>
    </span>

    <?php if ($spinner) { ?>
        <span data-kubit-button-spinner class="absolute inset-0 hidden place-items-center group-data-loading:grid">
            <x-kubit::icon name="loader-2" :class="\NiftyCo\Kubit\clsx($iconSize, 'animate-spin')" />
        </span>
    <?php } ?>
</x-kubit::button-or-link-pure>
