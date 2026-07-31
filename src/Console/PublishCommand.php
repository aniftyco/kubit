<?php

namespace NiftyCo\Kubit\Console;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use NiftyCo\Kubit\KubitServiceProvider;
use Symfony\Component\Finder\SplFileInfo;

class PublishCommand extends Command
{
    protected $signature = 'kubit:publish
                            {component?* : Components to publish, in dot notation. Publishes everything when omitted.}
                            {--force : Overwrite components that are already published}';

    protected $description = 'Copy Kubit components into resources/views/kubit so they can be edited';

    public function handle(Filesystem $files): int
    {
        $source = KubitServiceProvider::packagedComponentPath();
        $target = resource_path('views/kubit');

        $requested = (array) $this->argument('component');

        $components = collect($files->allFiles($source))
            ->filter(fn (SplFileInfo $file) => str_ends_with($file->getFilename(), '.blade.php'))
            ->keyBy(fn (SplFileInfo $file) => str_replace(
                '/',
                '.',
                substr($file->getRelativePathname(), 0, -strlen('.blade.php'))
            ));

        if ($requested !== []) {
            $missing = array_diff($requested, $components->keys()->all());

            if ($missing !== []) {
                $this->components->error('Unknown component: '.implode(', ', $missing));

                return self::FAILURE;
            }

            $components = $components->only($requested);
        }

        $published = 0;
        $skipped = 0;

        foreach ($components as $name => $file) {
            $destination = $target.'/'.$file->getRelativePathname();

            if ($files->exists($destination) && ! $this->option('force')) {
                $this->components->warn("Skipped [{$name}] — already published. Use --force to overwrite.");
                $skipped++;

                continue;
            }

            $files->ensureDirectoryExists(dirname($destination));
            $files->copy($file->getRealPath(), $destination);

            $this->components->info("Published [{$name}]");
            $published++;
        }

        if ($published > 0) {
            $this->newLine();
            $this->components->info("Published {$published} component(s) to resources/views/kubit.");
        }

        return $skipped > 0 && $published === 0 ? self::FAILURE : self::SUCCESS;
    }
}
