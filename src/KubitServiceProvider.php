<?php

namespace NiftyCo\Kubit;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\ComponentAttributeBag;
use Livewire\Blaze\Blaze;
use NiftyCo\Kubit\Console\InstallCommand;
use NiftyCo\Kubit\Console\PublishCommand;
use TailwindMerge\TailwindMerge;

class KubitServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('kubit', fn () => new KubitManager);

        $this->app->singleton('kubit.tailwind-merge', fn ($app) => TailwindMerge::factory()
            ->withConfiguration(V4Config::make(
                Arr::wrap($app['config']->get('kubit.tokens.spacing', [])),
                Arr::wrap($app['config']->get('kubit.tokens.radius', [])),
            ))
            // Merging runs per element and a page of Kubit components renders a lot
            // of them. Inputs are deterministic, so a flush only costs a rebuild.
            ->withCache($app['cache']->store())
            ->make());
    }

    public function boot(): void
    {
        $this->registerTagRewriter();
        $this->registerTagCompiler();
        $this->registerComponentPaths();
        $this->registerMacros();

        $this->registerBlazeOptimization();

        if ($this->app->runningInConsole()) {
            $this->commands([
                PublishCommand::class,
                InstallCommand::class,
            ]);
        }
    }

    protected function registerTagCompiler(): void
    {
        $compiler = new KubitTagCompiler(
            $this->app['blade.compiler']->getClassComponentAliases(),
            $this->app['blade.compiler']->getClassComponentNamespaces(),
            $this->app['blade.compiler'],
        );

        $this->app->instance('kubit.compiler', $compiler);

        $this->app['blade.compiler']->precompiler(fn ($in) => $compiler->compile($in));
    }

    /**
     * Registered in boot() rather than inside app()->booted(), which is what puts
     * it ahead of Blaze — Blaze registers its own precompiler only after the app
     * has booted, so it sees tags this has already rewritten.
     */
    protected function registerTagRewriter(): void
    {
        Blade::prepareStringsForCompilationUsing(
            fn (string $view) => KubitTagCompiler::rewrite($view)
        );
    }

    /**
     * User path first, so a published component shadows the packaged one. That is
     * all `kubit:publish` needs to work.
     */
    protected function registerComponentPaths(): void
    {
        if (is_dir($published = resource_path('views/kubit'))) {
            Blade::anonymousComponentPath($published, 'kubit');
        }

        Blade::anonymousComponentPath(static::packagedComponentPath(), 'kubit');
    }

    /**
     * The published path is registered too, and that matters more than it looks:
     * cross-boundary `@aware` only propagates when both parent and child are
     * compiled by Blaze, so a half-published pair breaks context propagation.
     */
    protected function registerBlazeOptimization(): void
    {
        $config = Blaze::optimize()
            ->in(static::packagedComponentPath())
            // Icons are heavily repeated and a pure function of name and variant.
            // Blaze resolves exact file matches ahead of directory ones.
            ->in(static::packagedComponentPath().'/icon.blade.php', memo: true);

        if (is_dir($published = resource_path('views/kubit'))) {
            $config->in($published);
        }
    }

    /**
     * Flux registers macros of the same names and the same shape, and a macro
     * store is last-write-wins with nothing to say a collision happened. Both
     * definitions are interchangeable, so deferring to whichever provider booted
     * first keeps an app that installs both from depending on provider order.
     */
    protected function registerMacros(): void
    {
        if (! ComponentAttributeBag::hasMacro('pluck')) {
            ComponentAttributeBag::macro('pluck', function ($key, $default = null) {
                $result = $this->get($key);

                unset($this->attributes[$key]);

                return $result ?? $default;
            });
        }
    }

    public static function packagedComponentPath(): string
    {
        return dirname(__DIR__).'/stubs/resources/views/kubit';
    }
}
