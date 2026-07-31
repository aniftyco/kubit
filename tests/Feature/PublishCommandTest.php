<?php

use Illuminate\Support\Facades\File;

beforeEach(function () {
    File::deleteDirectory(resource_path('views/kubit'));
});

afterEach(function () {
    File::deleteDirectory(resource_path('views/kubit'));
});

it('publishes every component by default', function () {
    $this->artisan('kubit:publish')->assertSuccessful();

    expect(File::exists(resource_path('views/kubit/button.blade.php')))->toBeTrue()
        ->and(File::exists(resource_path('views/kubit/icon.blade.php')))->toBeTrue();
});

it('publishes a single named component', function () {
    $this->artisan('kubit:publish', ['component' => ['icon']])->assertSuccessful();

    expect(File::exists(resource_path('views/kubit/icon.blade.php')))->toBeTrue()
        ->and(File::exists(resource_path('views/kubit/button.blade.php')))->toBeFalse();
});

it('rejects an unknown component', function () {
    $this->artisan('kubit:publish', ['component' => ['nope']])->assertFailed();
});

it('refuses to overwrite without force', function () {
    $this->artisan('kubit:publish', ['component' => ['icon']])->assertSuccessful();

    File::put(resource_path('views/kubit/icon.blade.php'), 'EDITED');

    $this->artisan('kubit:publish', ['component' => ['icon']])->assertFailed();

    expect(File::get(resource_path('views/kubit/icon.blade.php')))->toBe('EDITED');
});

it('overwrites with force', function () {
    $this->artisan('kubit:publish', ['component' => ['icon']])->assertSuccessful();

    File::put(resource_path('views/kubit/icon.blade.php'), 'EDITED');

    $this->artisan('kubit:publish', ['component' => ['icon'], '--force' => true])->assertSuccessful();

    expect(File::get(resource_path('views/kubit/icon.blade.php')))->not->toBe('EDITED');
});
