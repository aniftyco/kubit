@blaze(fold: true, unsafe: ['class'])

@props([
    'name',
    'variant' => 'outline',
])

<?php
// Tabler ships one flat set: outline is the bare name, filled carries a suffix.
// Wrapping the provider means replacing it later touches this file and nothing else.
$file = 'tabler-'.$name.($variant === 'filled' ? '-filled' : '');

// Decorative unless the consumer gave it an accessible name. React reads the prop
// for truthiness, so an empty `aria-label` labels nothing in either stack.
$a11y = $attributes->filled('aria-label') ? [] : ['aria-hidden' => 'true'];

$svg = svg($file, '', [
    'data-kubit-icon' => '',
    ...$attributes->except('class')->getAttributes(),
    ...$a11y,
])->toHtml();

// The set's own markup already carries a class and blade-icons splices its
// attributes in without touching it, which puts two `class` attributes on one
// element. Fold them into one — Tabler's first so ours resolves last — which is
// the single merged class React's icon emits.
$svg = preg_replace_callback('/<svg\b[^>]*>/', function (array $tag) use ($attributes) {
    preg_match_all('/\sclass="([^"]*)"/', $tag[0], $found);

    $class = \NiftyCo\Kubit\clsx($found[1], 'size-icon shrink-0', $attributes->get('class'));

    return substr_replace(
        preg_replace('/\sclass="[^"]*"/', '', $tag[0]),
        ' class="'.$class.'"',
        strlen('<svg'),
        0,
    );
}, $svg, 1);
?>

{!! $svg !!}
