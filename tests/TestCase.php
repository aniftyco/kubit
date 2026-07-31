<?php

namespace Tests;

use BladeUI\Icons\BladeIconsServiceProvider;
use Illuminate\Support\Facades\File;
use Livewire\Blaze\BlazeServiceProvider;
use NiftyCo\Kubit\KubitServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;
use secondnetwork\TablerIcons\BladeTablerIconsServiceProvider;

abstract class TestCase extends Orchestra
{
    /** @var list<string> */
    protected array $temporaryViews = [];

    protected function getPackageProviders($app): array
    {
        return [
            BladeIconsServiceProvider::class,
            BladeTablerIconsServiceProvider::class,
            BlazeServiceProvider::class,
            KubitServiceProvider::class,
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();

        File::ensureDirectoryExists($this->viewPath());
        File::ensureDirectoryExists($compiled = $this->app['config']->get('view.compiled'));

        // Blaze caches compiled component functions on disk. A stale cache hides
        // real breakage, so every test starts from nothing compiled.
        File::cleanDirectory($compiled);
    }

    protected function tearDown(): void
    {
        foreach ($this->temporaryViews as $path) {
            File::delete($path);
        }

        $this->temporaryViews = [];

        parent::tearDown();
    }

    protected function viewPath(): string
    {
        return $this->app['config']->get('view.paths')[0];
    }

    /**
     * Write a template to disk and render it through the full pipeline.
     *
     * Blaze compiles files rather than strings, so anything asserting on fold
     * behaviour has to go through a real view on disk.
     */
    protected function render(string $template, array $data = []): string
    {
        return trim((string) view($this->makeView($template), $data)->render());
    }

    /**
     * The compiled PHP for a template — what Blaze's fold markers show up in.
     */
    protected function compiled(string $template, array $data = []): string
    {
        $view = $this->makeView($template);
        $path = $this->viewPath().'/'.$view.'.blade.php';

        view($view, $data)->render();

        return File::get($this->app['blade.compiler']->getCompiledPath($path));
    }

    protected function makeView(string $template): string
    {
        $name = 'kubit_test_'.substr(md5($template), 0, 16);
        $path = $this->viewPath().'/'.$name.'.blade.php';

        File::put($path, $template);

        $this->temporaryViews[] = $path;

        return $name;
    }
}
