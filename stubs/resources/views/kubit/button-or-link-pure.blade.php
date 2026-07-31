@blaze(fold: true, unsafe: ['class'])

@props([
    'as' => null,
    'href' => null,
    'type' => null,
    'disabled' => false,
])

<?php
// An explicit `as` wins; otherwise the presence of `href` picks the element.
$tag = $as ?: ($href !== null ? 'a' : 'button');

// A disabled link can't use the `disabled` attribute — it isn't a form control —
// so it drops its href and says so through aria instead.
$semantics = match ($tag) {
    'a' => [
        'href' => $disabled ? null : $href,
        'aria-disabled' => $disabled ? 'true' : null,
        'tabindex' => $disabled ? '-1' : null,
    ],
    'button' => [
        'type' => $type ?: 'button',
        'disabled' => $disabled ?: null,
    ],
    default => [],
};
?>

<{{ $tag }} {{ $attributes->merge(array_filter($semantics, fn ($value) => $value !== null)) }}>{{ $slot }}</{{ $tag }}>
