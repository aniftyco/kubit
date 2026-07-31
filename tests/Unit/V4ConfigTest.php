<?php

use function NiftyCo\Kubit\clsx;

use NiftyCo\Kubit\V4Config;

/**
 * tailwind-merge-php's conflict groups are v3-era. These pin the v4 behaviour
 * V4Config adds; when upstream ships v4 support the patch drops out and these
 * stay, unchanged and still passing.
 */
describe('kubit theme tokens', function () {
    // tailwind-merge validates a class's value against the scale it belongs to,
    // and `control` is not a length. Without registering it, a component default
    // and a consumer override both survive and fall back to cascade order —
    // silently, at the call site.
    it('lets a utility override a radius token', function () {
        expect(clsx('rounded-control', 'rounded-full'))->toBe('rounded-full');
    });

    it('lets a radius token override a utility', function () {
        expect(clsx('rounded-full', 'rounded-control'))->toBe('rounded-control');
    });

    it('merges control height against a utility height', function () {
        expect(clsx('h-control', 'h-8'))->toBe('h-8');
    });

    it('merges every spacing token Kubit ships', function (string $token) {
        expect(clsx("h-{$token}", 'h-8'))->toBe('h-8');
    })->with(V4Config::SPACING_TOKENS);

    it('merges size against the control token', function () {
        expect(clsx('size-control', 'size-8'))->toBe('size-8');
    });
});

describe('tailwind v4 class groups', function () {
    it('merges inset-shadow sizes', function () {
        expect(clsx('inset-shadow-sm', 'inset-shadow-lg'))->toBe('inset-shadow-lg');
    });

    it('keeps inset-shadow size and color apart', function () {
        expect(clsx('inset-shadow-sm', 'inset-shadow-red-500'))
            ->toBe('inset-shadow-sm inset-shadow-red-500');
    });

    it('merges inset-ring widths', function () {
        expect(clsx('inset-ring-2', 'inset-ring-4'))->toBe('inset-ring-4');
    });

    it('keeps inset-ring width and color apart', function () {
        expect(clsx('inset-ring-2', 'inset-ring-red-500'))->toBe('inset-ring-2 inset-ring-red-500');
    });

    it('merges text-shadow sizes', function () {
        expect(clsx('text-shadow-sm', 'text-shadow-lg'))->toBe('text-shadow-lg');
    });

    it('keeps text-shadow size and color apart', function () {
        expect(clsx('text-shadow-lg', 'text-shadow-red-500'))
            ->toBe('text-shadow-lg text-shadow-red-500');
    });

    it('merges field-sizing', function () {
        expect(clsx('field-sizing-content', 'field-sizing-fixed'))->toBe('field-sizing-fixed');
    });

    it('merges color-scheme', function () {
        expect(clsx('scheme-light', 'scheme-dark'))->toBe('scheme-dark');
    });
});

describe('groups the v3 config already handled', function () {
    // Guards against V4Config's additions shadowing a group that already worked.
    it('leaves existing behaviour intact', function (string $input, string $expected) {
        expect(clsx($input))->toBe($expected);
    })->with([
        ['size-4 size-8', 'size-8'],
        ['shadow-sm shadow-lg', 'shadow-lg'],
        ['shadow-sm shadow-red-500', 'shadow-sm shadow-red-500'],
        ['ring-2 ring-4', 'ring-4'],
        ['text-sm text-xl', 'text-xl'],
        ['text-sm text-red-500', 'text-sm text-red-500'],
        ['bg-linear-to-r bg-linear-to-l', 'bg-linear-to-l'],
        ['inset-0 inset-4', 'inset-4'],
        ['p-4 px-2', 'p-4 px-2'],
    ]);
});
