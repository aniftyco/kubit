<?php

namespace NiftyCo\Kubit;

use TailwindMerge\Validators\AnyValueValidator;
use TailwindMerge\Validators\ArbitraryLengthValidator;
use TailwindMerge\Validators\ArbitraryShadowValidator;
use TailwindMerge\Validators\LengthValidator;
use TailwindMerge\Validators\TshirtSizeValidator;

/**
 * Tailwind v4 coverage for gehrisandro/tailwind-merge-php, whose conflict groups
 * are v3-era. Upstream issues #16 and #17 track this; when v4 support lands, this
 * class drops out and the tests that pin its behaviour stay.
 *
 * Two distinct jobs:
 *
 * 1. Registering Kubit's own theme keys. tailwind-merge validates a class's value
 *    against the theme scale it belongs to, and `control` is not a length — so
 *    `rounded-control rounded-full` and `h-control h-8` both survive the merge and
 *    fall back to cascade order. Colors escape this because the color scale accepts
 *    any bare word, which is why `bg-accent` works and `rounded-control` does not.
 *    Every non-color token Kubit ships has to be declared here or overriding it
 *    fails silently at the call site.
 *
 * 2. Class groups Tailwind v4 added that the v3 config has no entry for.
 */
class V4Config
{
    /**
     * Kubit's `--spacing-*` theme keys. Mirrors resources/css/kubit.css; the token
     * sync test fails the build if the two drift apart.
     *
     * @var list<string>
     */
    public const SPACING_TOKENS = [
        'control',
        'control-sm',
        'control-xs',
        'icon',
    ];

    /**
     * Kubit's `--radius-*` theme keys.
     *
     * @var list<string>
     */
    public const RADIUS_TOKENS = [
        'control',
    ];

    /**
     * @param  list<string>  $spacing  Additional `--spacing-*` keys from the consuming app.
     * @param  list<string>  $radius  Additional `--radius-*` keys from the consuming app.
     * @return array<string, mixed>
     */
    public static function make(array $spacing = [], array $radius = []): array
    {
        return [
            'theme' => [
                'spacing' => [...self::SPACING_TOKENS, ...$spacing],
                'borderRadius' => [...self::RADIUS_TOKENS, ...$radius],
            ],
            'classGroups' => [
                'inset-shadow' => [['inset-shadow' => ['', 'none', TshirtSizeValidator::validate(...), ArbitraryShadowValidator::validate(...)]]],
                'inset-shadow-color' => [['inset-shadow' => [AnyValueValidator::validate(...)]]],
                'inset-ring-w' => [['inset-ring' => ['', LengthValidator::validate(...), ArbitraryLengthValidator::validate(...)]]],
                'inset-ring-color' => [['inset-ring' => [AnyValueValidator::validate(...)]]],
                'text-shadow' => [['text-shadow' => ['', 'none', TshirtSizeValidator::validate(...), ArbitraryShadowValidator::validate(...)]]],
                'text-shadow-color' => [['text-shadow' => [AnyValueValidator::validate(...)]]],
                'field-sizing' => [['field-sizing' => ['content', 'fixed']]],
                'scheme' => [['scheme' => ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light']]],
            ],
        ];
    }
}
