<?php

use NiftyCo\Kubit\Kubit;

it('resolves components through the hashed anonymous namespace', function () {
    expect(Kubit::componentExists('button'))->toBeTrue()
        ->and(Kubit::componentExists('icon'))->toBeTrue()
        ->and(Kubit::componentExists('nope'))->toBeFalse();
});
