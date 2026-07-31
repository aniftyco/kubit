<?php

namespace NiftyCo\Kubit\Console;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\text;

use Symfony\Component\Finder\SplFileInfo;

class InstallCommand extends Command
{
    protected $signature = 'kubit:install
                            {stylesheet?* : Stylesheets to install into, relative to the resources directory}';

    protected $description = 'Add the Kubit theme import and component source path to your stylesheets';

    public function handle(Filesystem $files): int
    {
        $stylesheets = array_values(array_filter((array) $this->argument('stylesheet')));

        if ($stylesheets === []) {
            $stylesheets = $this->choose($files);
        }

        if ($stylesheets === []) {
            $this->components->warn('No stylesheet selected — nothing to install.');

            return self::SUCCESS;
        }

        $missing = array_values(array_filter(
            $stylesheets,
            fn (string $stylesheet) => ! $files->exists($this->resolve($stylesheet))
        ));

        if ($missing !== []) {
            foreach ($missing as $stylesheet) {
                $this->components->error("Stylesheet [{$this->relative($stylesheet)}] not found.");
            }

            return self::FAILURE;
        }

        foreach ($stylesheets as $stylesheet) {
            $this->install($files, $stylesheet);
        }

        return self::SUCCESS;
    }

    /**
     * Ask which of the app's stylesheets Kubit belongs in, creating one when the
     * app has none yet.
     *
     * @return list<string>
     */
    protected function choose(Filesystem $files): array
    {
        $available = $this->discover($files);

        if ($available === []) {
            return [$this->create($files)];
        }

        return array_values(multiselect(
            label: 'Which stylesheets should Kubit be installed into?',
            options: $available,
            default: array_slice($available, 0, 1),
            scroll: 10,
            hint: 'Paths are relative to the resources directory.',
        ));
    }

    /**
     * Every stylesheet under the resources directory, relative to it.
     *
     * @return list<string>
     */
    protected function discover(Filesystem $files): array
    {
        $resources = base_path('resources');

        if (! $files->isDirectory($resources)) {
            return [];
        }

        return collect($files->allFiles($resources))
            ->filter(fn (SplFileInfo $file) => $file->getExtension() === 'css')
            ->map(fn (SplFileInfo $file) => str_replace('\\', '/', $file->getRelativePathname()))
            ->sort()
            ->values()
            ->all();
    }

    /**
     * Write a starting stylesheet for an app that has none.
     */
    protected function create(Filesystem $files): string
    {
        $stylesheet = trim(text(
            label: 'No stylesheets found. Where should Kubit create one?',
            placeholder: 'css/app.css',
            default: 'css/app.css',
            hint: 'Relative to the resources directory.',
        ));

        if ($stylesheet === '') {
            $stylesheet = 'css/app.css';
        }

        $path = $this->resolve($stylesheet);

        $files->ensureDirectoryExists(dirname($path));
        $files->put($path, '@import "tailwindcss";'.PHP_EOL);

        $this->components->info("Created {$this->relative($stylesheet)}.");

        return $stylesheet;
    }

    protected function install(Filesystem $files, string $stylesheet): void
    {
        $path = $this->resolve($stylesheet);
        $contents = $files->get($path);

        $missing = array_values(array_filter(
            $this->lines($path),
            fn (string $line) => ! str_contains($contents, $line)
        ));

        if ($missing === []) {
            $this->components->info("Kubit is already installed in {$this->relative($stylesheet)}.");

            return;
        }

        // After the app's own `@import "tailwindcss"`, so the theme can build on it.
        $files->put($path, rtrim($contents, "\n")."\n".implode("\n", $missing)."\n");

        $this->components->info("Installed Kubit into {$this->relative($stylesheet)}.");

        foreach ($missing as $line) {
            $this->line("  {$line}");
        }
    }

    /**
     * Tailwind only scans what it is pointed at, and an installed package sits
     * outside the app's own source tree. Without the `@source` line every Kubit
     * component renders unstyled.
     *
     * @return list<string>
     */
    protected function lines(string $path): array
    {
        $vendor = $this->vendorPathFrom($path);

        return [
            "@import \"{$vendor}/resources/css/kubit.css\";",
            "@source \"{$vendor}/stubs\";",
        ];
    }

    /**
     * Tailwind resolves both directives relative to the file they appear in, so
     * the number of hops out to the vendor directory depends on how deeply the
     * stylesheet is nested. Getting it wrong fails silently — the build simply
     * produces unstyled components — so it is computed per file.
     */
    protected function vendorPathFrom(string $path): string
    {
        $from = $this->segments(dirname($path));
        $to = $this->segments($this->packagePath());

        while ($from !== [] && $to !== [] && $from[0] === $to[0]) {
            array_shift($from);
            array_shift($to);
        }

        $relative = implode('/', [...array_fill(0, count($from), '..'), ...$to]);

        return str_starts_with($relative, '..') ? $relative : './'.$relative;
    }

    /**
     * Where Kubit actually sits on disk. Composer's vendor directory is
     * configurable and a path repository puts the package outside it entirely,
     * so assuming `vendor/aniftyco/kubit` writes directives pointing at nothing
     * — and Tailwind says nothing about a source it cannot find.
     */
    protected function packagePath(): string
    {
        return dirname(__DIR__, 2);
    }

    /**
     * @return list<string>
     */
    protected function segments(string $path): array
    {
        return array_values(array_filter(
            explode('/', str_replace('\\', '/', $path)),
            fn (string $segment) => $segment !== '' && $segment !== '.'
        ));
    }

    protected function resolve(string $stylesheet): string
    {
        return base_path('resources/'.ltrim($stylesheet, '/'));
    }

    protected function relative(string $stylesheet): string
    {
        return 'resources/'.ltrim($stylesheet, '/');
    }
}
