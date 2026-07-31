<?php

it('compiles a kubit tag into a rendered component', function () {
    $html = $this->render('<kubit:button variant="primary">Save</kubit:button>');

    expect($html)
        ->toContain('<button')
        ->toContain('Save')
        ->toContain('data-kubit-button');
});

it('compiles a self-closing kubit tag', function () {
    $html = $this->render('<kubit:icon name="chevron-down" />');

    expect($html)
        ->toContain('<svg')
        ->toContain('data-kubit-icon');
});

it('leaves laravel x- tags to laravel', function () {
    $html = $this->render('<kubit:button>Save</kubit:button>');

    expect($html)->not->toContain('kubit:button');
});

it('resolves dot notation to nested directories', function () {
    $html = $this->render('<kubit:button-or-link-pure href="/docs">Docs</kubit:button-or-link-pure>');

    expect($html)
        ->toContain('<a')
        ->toContain('href="/docs"');
});
