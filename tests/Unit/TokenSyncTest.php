<?php

use NiftyCo\Kubit\V4Config;

/**
 * V4Config mirrors the token names in kubit.css by hand, because tailwind-merge
 * needs them registered and parsing CSS at runtime is not worth it. That mirror
 * is only safe if drift fails the build.
 */
function themeKeys(string $namespace): array
{
    $css = file_get_contents(__DIR__.'/../../resources/css/kubit.css');

    preg_match_all('/^\s*--'.$namespace.'-([\w-]+):/m', $css, $matches);

    return array_values(array_unique($matches[1]));
}

it('registers every spacing token from kubit.css', function () {
    expect(themeKeys('spacing'))->toEqualCanonicalizing(V4Config::SPACING_TOKENS);
});

it('registers every radius token from kubit.css', function () {
    expect(themeKeys('radius'))->toEqualCanonicalizing(V4Config::RADIUS_TOKENS);
});

it('accepts extra tokens from the consuming app', function () {
    $config = V4Config::make(spacing: ['sidebar'], radius: ['card']);

    expect($config['theme']['spacing'])->toContain('sidebar')
        ->and($config['theme']['spacing'])->toContain('control')
        ->and($config['theme']['borderRadius'])->toContain('card')
        ->and($config['theme']['borderRadius'])->toContain('control');
});
