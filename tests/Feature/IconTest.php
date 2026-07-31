<?php

/**
 * The opening tag of the first — or nth — `<svg>` in a fragment. Every attribute
 * assertion in this file is about that tag rather than the paths inside it.
 */
function svgTags(string $html): array
{
    preg_match_all('/<svg\b[^>]*>/', $html, $tags);

    return $tags[0];
}

it('renders an svg for a kebab-case name', function () {
    expect($this->render('<kubit:icon name="chevron-down" />'))
        ->toContain('<svg')
        ->toContain('data-kubit-icon');
});

it('renders the filled variant', function () {
    $outline = $this->render('<kubit:icon name="user" />');
    $filled = $this->render('<kubit:icon name="user" variant="filled" />');

    expect($filled)->not->toBe($outline);
});

it('hides decorative icons from assistive technology', function () {
    expect($this->render('<kubit:icon name="chevron-down" />'))
        ->toContain('aria-hidden="true"');
});

it('leaves a named icon exposed', function () {
    $html = $this->render('<kubit:icon name="user" aria-label="Account" />');

    expect($html)
        ->toContain('aria-label="Account"')
        ->not->toContain('aria-hidden');
});

it('sizes from a token by default', function () {
    expect($this->render('<kubit:icon name="user" />'))->toContain('size-icon');
});

it('lets a consumer class displace the size token', function () {
    expect($this->render('<kubit:icon name="user" class="size-8" />'))
        ->toContain('size-8')
        ->not->toContain('size-icon');
});

/**
 * The icon set's markup arrives with a class of its own and the provider splices
 * ours in beside it, so the element goes out with two `class` attributes unless
 * the component folds them. Two is invalid HTML and it is not what React emits —
 * there the set's classes and ours end up in one string.
 */
it('emits exactly one class attribute, carrying the set classes and ours', function () {
    $tag = svgTags($this->render('<kubit:icon name="check" class="size-8" />'))[0];

    expect(substr_count($tag, 'class="'))->toBe(1);

    expect($tag)
        ->toContain('icon-tabler')
        ->toContain('shrink-0')
        ->toContain('size-8');
});

// Identity attributes are presence-only, and React writes `data-kubit-icon=""`.
it('marks the icon with a valueless identity attribute', function () {
    expect($this->render('<kubit:icon name="user" />'))
        ->toContain('data-kubit-icon=""')
        ->not->toContain('data-kubit-icon="1"');
});

/**
 * React reads `aria-label` for truthiness, so an empty one names nothing and the
 * icon stays decorative. Testing only for the attribute's presence would leave the
 * two stacks disagreeing on the same markup.
 */
it('treats an empty aria-label as no accessible name', function () {
    expect($this->render('<kubit:icon name="user" aria-label="" />'))
        ->toContain('aria-hidden="true"');
});

/**
 * The component is memoised, which is only safe while the memo key covers
 * everything that reaches the output. Rendering every axis — none, class, variant,
 * label — in one pass is what would catch a key that misses one of them.
 */
it('memoises without leaking between call sites', function () {
    $tags = svgTags($this->render(<<<'BLADE'
        <kubit:icon name="user" />
        <kubit:icon name="user" class="size-8" />
        <kubit:icon name="user" variant="filled" />
        <kubit:icon name="user" aria-label="Account" />
        BLADE));

    expect($tags)->toHaveCount(4);

    [$plain, $sized, $filled, $named] = $tags;

    expect($plain)->toContain('size-icon')->toContain('aria-hidden="true"');

    expect($sized)->toContain('size-8')->not->toContain('size-icon');

    expect($filled)->toContain('icons-tabler-filled')->not->toContain('icons-tabler-outline');

    expect($named)->toContain('aria-label="Account"')->not->toContain('aria-hidden');

    // Four call sites, four distinct results — no memo entry stood in for another.
    expect(array_unique($tags))->toHaveCount(4);
});
