<?php

use function NiftyCo\Kubit\clsx;

it('merges conflicting utilities so the last one wins', function () {
    expect(clsx('text-sm', 'text-xl'))->toBe('text-xl');
});

it('keeps non-conflicting utilities', function () {
    expect(clsx('inline-flex', 'items-center'))->toBe('inline-flex items-center');
});

it('takes classes from conditional arrays', function () {
    expect(clsx('h-control', ['bg-accent' => true, 'bg-danger' => false]))
        ->toBe('h-control bg-accent');
});

it('flattens nested arrays in order', function () {
    expect(clsx(['text-sm', ['text-base', 'text-xl']]))->toBe('text-xl');
});

it('ignores null, false, and empty values', function () {
    expect(clsx('inline-flex', null, false, '', 'gap-2'))->toBe('inline-flex gap-2');
});

it('returns an empty string when given nothing', function () {
    expect(clsx())->toBe('')
        ->and(clsx(null, false))->toBe('');
});

it('lets a consumer class displace a component default', function () {
    $componentDefault = 'rounded-control bg-accent text-sm';

    expect(clsx($componentDefault, 'text-xl'))->toBe('rounded-control bg-accent text-xl');
});
