<?php

use Illuminate\Support\Facades\File;
use Symfony\Component\Finder\SplFileInfo;

/**
 * The command walks the whole resources tree, so every test starts with no
 * stylesheets on disk and writes only the ones it cares about.
 */
$clean = function () {
    collect(File::allFiles(base_path('resources')))
        ->filter(fn (SplFileInfo $file) => $file->getExtension() === 'css')
        ->each(fn (SplFileInfo $file) => File::delete($file->getPathname()));

    foreach (['css', 'styles'] as $directory) {
        File::deleteDirectory(base_path('resources/'.$directory));
    }
};

beforeEach($clean);
afterEach($clean);

function writeStylesheet(string $stylesheet, string $contents = '@import "tailwindcss";'.PHP_EOL): string
{
    $path = base_path('resources/'.$stylesheet);

    File::ensureDirectoryExists(dirname($path));
    File::put($path, $contents);

    return $path;
}

/**
 * Kubit resolves where it actually sits rather than assuming a vendor directory,
 * so what the directives point at depends on the package's real location. Counting
 * the hops down from it is an independent way to arrive at the same answer.
 */
function packagePathFrom(string $stylesheet): string
{
    $package = dirname(__DIR__, 2);
    $below = trim(str_replace($package, '', dirname(base_path('resources/'.$stylesheet))), '/');

    return implode('/', array_fill(0, count(explode('/', $below)), '..'));
}

it('installs into a stylesheet named relative to the resources directory', function () {
    writeStylesheet('css/app.css');

    $this->artisan('kubit:install', ['stylesheet' => ['css/app.css']])->assertSuccessful();

    $package = packagePathFrom('css/app.css');

    expect(File::get(base_path('resources/css/app.css')))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";")
        // Tailwind only scans what it is pointed at, and an installed package sits
        // outside the app's source tree. Without this every component is unstyled.
        ->toContain("@source \"{$package}/stubs\";")
        ->toContain('@import "tailwindcss";');
});

it('installs into several named stylesheets at once', function () {
    writeStylesheet('css/app.css');
    writeStylesheet('css/admin.css');

    $this->artisan('kubit:install', ['stylesheet' => ['css/app.css', 'css/admin.css']])
        ->assertSuccessful();

    $package = packagePathFrom('css/app.css');

    expect(File::get(base_path('resources/css/app.css')))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";");

    expect(File::get(base_path('resources/css/admin.css')))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";")
        ->toContain("@source \"{$package}/stubs\";");
});

it('offers every stylesheet under resources when none is named', function () {
    writeStylesheet('css/app.css');
    writeStylesheet('css/admin.css');
    writeStylesheet('styles/marketing.css');

    $this->artisan('kubit:install')
        ->expectsChoice(
            'Which stylesheets should Kubit be installed into?',
            ['css/admin.css', 'styles/marketing.css'],
            ['css/admin.css', 'css/app.css', 'styles/marketing.css'],
        )
        ->assertSuccessful();

    $package = packagePathFrom('css/admin.css');

    expect(File::get(base_path('resources/css/admin.css')))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";");

    expect(File::get(base_path('resources/styles/marketing.css')))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";");

    // Not selected, so it stays untouched.
    expect(File::get(base_path('resources/css/app.css')))
        ->not->toContain("@import \"{$package}/resources/css/kubit.css\";");
});

it('creates a stylesheet when the app has none', function () {
    $this->artisan('kubit:install')
        ->expectsQuestion('No stylesheets found. Where should Kubit create one?', 'css/app.css')
        ->assertSuccessful();

    expect(File::exists(base_path('resources/css/app.css')))->toBeTrue();

    $package = packagePathFrom('css/app.css');

    expect(File::get(base_path('resources/css/app.css')))
        ->toContain('@import "tailwindcss";')
        ->toContain("@import \"{$package}/resources/css/kubit.css\";")
        ->toContain("@source \"{$package}/stubs\";");
});

it('creates the parent directories of the stylesheet it is asked for', function () {
    $this->artisan('kubit:install')
        ->expectsQuestion('No stylesheets found. Where should Kubit create one?', 'styles/nested/deep/app.css')
        ->assertSuccessful();

    $package = packagePathFrom('styles/nested/deep/app.css');

    expect(File::get(base_path('resources/styles/nested/deep/app.css')))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";");
});

it('is idempotent', function () {
    writeStylesheet('css/app.css');

    $this->artisan('kubit:install', ['stylesheet' => ['css/app.css']])->assertSuccessful();
    $first = File::get(base_path('resources/css/app.css'));

    $this->artisan('kubit:install', ['stylesheet' => ['css/app.css']])->assertSuccessful();

    expect(File::get(base_path('resources/css/app.css')))->toBe($first);
});

it('walks back to the package directory from wherever the stylesheet sits', function (string $stylesheet) {
    $path = writeStylesheet($stylesheet);

    $this->artisan('kubit:install', ['stylesheet' => [$stylesheet]])->assertSuccessful();

    $package = packagePathFrom($stylesheet);

    expect(File::get($path))
        ->toContain("@import \"{$package}/resources/css/kubit.css\";")
        ->toContain("@source \"{$package}/stubs\";");

    // A directive Tailwind cannot resolve fails silently, so the hops have to
    // land on the files that are actually there.
    expect(realpath(dirname($path).'/'.$package.'/stubs'))->toBe(dirname(__DIR__, 2).'/stubs');
    expect(realpath(dirname($path).'/'.$package.'/resources/css/kubit.css'))
        ->toBe(dirname(__DIR__, 2).'/resources/css/kubit.css');
})->with([
    'app.css',
    'css/app.css',
    'css/themes/dark.css',
    'css/themes/brand/dark.css',
]);

it('fails when a named stylesheet is missing', function () {
    writeStylesheet('css/app.css');

    $this->artisan('kubit:install', ['stylesheet' => ['css/nope.css']])->assertFailed();
});
